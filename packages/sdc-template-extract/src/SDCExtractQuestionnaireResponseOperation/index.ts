// Export interfaces
export * from './interfaces';

// Export utils
export * from './utils';

import type { ExtractInputParameters, ExtractOutputParameters, DebugInfo, ExtendedObservation } from './types';
import { hasTemplateExtractExtension, getNestedAnswerValue } from './utils';

const emptyDebugInfo: DebugInfo = {
  contentAnalysis: {
    detectedTemplates: [],
    confidence: 'Invalid',
    patterns: []
  },
  fieldMapping: {
    mappedFields: {},
    assumptions: [],
    alternatives: []
  },
  valueProcessing: {
    values: {},
    transformations: [],
    qualityChecks: []
  },
  resultGeneration: {
    status: 'Pending',
    observations: []
  }
};

// Helper to recursively find an item by linkId
function findItemByLinkId(items: any[], linkId: string): any | undefined {
  for (const item of items) {
    if (item.linkId === linkId) return item;
    if (item.item) {
      const found = findItemByLinkId(item.item, linkId);
      if (found) return found;
    }
  }
  return undefined;
}

// Generic recursive matcher: match by code, then by linkId
function findMatchingResponseItem(items: any[], template: any, code?: string, linkId?: string): any | undefined {
  for (const item of items) {
    console.log('Checking item:', item.linkId);
    // 1. Match by code if available
    if (
      code &&
      item.code?.coding?.some((c: any) => c.code === code)
    ) {
      return item;
    }
    // 2. Match by linkId
    console.log('Comparing', typeof item.linkId, item.linkId, 'with', typeof linkId, linkId);
    if (linkId && item.linkId === linkId) {
      return item;
    }
    // 3. Always recursively search nested items, even for groups
    if (item.item) {
      const found = findMatchingResponseItem(item.item, template, code, linkId);
      if (found) return found;
    }
  }
  return undefined;
}

export async function extract(params: ExtractInputParameters): Promise<ExtractOutputParameters> {
  const { questionnaireResponse, questionnaire } = params;

  // For now, assume questionnaire is provided directly
  if (!questionnaire) {
    return {
      result: null,
      error: 'Missing questionnaire',
      debugInfo: emptyDebugInfo
    };
  }

  // Basic type guard for Questionnaire
  if (questionnaire.resourceType !== 'Questionnaire') {
    return {
      result: null,
      error: 'Provided resource is not a Questionnaire',
      debugInfo: emptyDebugInfo
    };
  }

  // Type assertion for easier access
  const q = questionnaire as any;

  const debugInfo: DebugInfo = {
    contentAnalysis: {
      detectedTemplates: [],
      confidence: 'Valid',
      patterns: []
    },
    fieldMapping: {
      mappedFields: {},
      assumptions: [],
      alternatives: []
    },
    valueProcessing: {
      values: {},
      transformations: [],
      qualityChecks: []
    },
    resultGeneration: {
      status: 'Pending',
      observations: []
    }
  };

  // Validation
  if (!q.item) {
    debugInfo.contentAnalysis.confidence = 'Invalid';
    return {
      result: null,
      error: 'Questionnaire has no items',
      debugInfo
    };
  }
  if (!q.contained || q.contained.length === 0) {
    debugInfo.contentAnalysis.confidence = 'Invalid';
    return {
      result: null,
      error: 'Questionnaire has no contained resources for templates',
      debugInfo
    };
  }
  if (!questionnaireResponse.item) {
    debugInfo.contentAnalysis.confidence = 'Invalid';
    return {
      result: null,
      error: 'Response has no items',
      debugInfo
    };
  }

  // Check for template extraction extension
  const hasTemplateExtract = hasTemplateExtractExtension(q);
  let itemsWithTemplates: string[] = [];
  const checkItemsForTemplates = (items: any[]): boolean => {
    let found = false;
    for (const item of items) {
      if (hasTemplateExtractExtension(item)) {
        found = true;
        itemsWithTemplates.push(item.linkId);
      }
      if (item.item && checkItemsForTemplates(item.item)) {
        found = true;
      }
    }
    return found;
  };
  const hasItemTemplates = checkItemsForTemplates(q.item);
  if (!hasTemplateExtract && !hasItemTemplates) {
    debugInfo.contentAnalysis.confidence = 'Invalid';
    debugInfo.contentAnalysis.detectedTemplates.push('No template type detected');
    return {
      result: null,
      error: 'Questionnaire is not configured for template extraction',
      debugInfo
    };
  }

  // Template analysis and field mapping
  const templates = q.contained;
  debugInfo.contentAnalysis.detectedTemplates = templates.map((t: any) => t.id || 'unnamed');

  // For now, only handle Observation templates
  const observationTemplates = templates.filter((t: any) => t.resourceType === 'Observation');

  // Log the contained templates
  console.log('Contained templates:', templates);
  // Log the questionnaire items
  console.log('Questionnaire items:', q.item);

  debugInfo.fieldMapping.mappedFields = observationTemplates.reduce((acc: Record<string, any>, template: any) => {
    const code = template.code?.coding?.[0]?.code;
    const item = findMatchingResponseItem(questionnaireResponse.item ?? [], template, code, template.id);
    console.log('Matching item for code', code, ':', item);
    acc[code] = {
      templateId: template.id,
      type: template.resourceType,
      itemType: item?.type ?? null,
      itemLinkId: item?.linkId ?? null,
      itemText: item?.text ?? template.text ?? 'No text',
      warning: item ? undefined : 'No matching questionnaire item found'
    };
    return acc;
  }, {});

  // Add relevant assumptions about the mapping
  if (Object.keys(debugInfo.fieldMapping.mappedFields).length === 0) {
    debugInfo.fieldMapping.assumptions.push('No fields could be mapped between templates and questionnaire items');
  } else {
    debugInfo.fieldMapping.assumptions.push(`Successfully mapped ${Object.keys(debugInfo.fieldMapping.mappedFields).length} fields`);
  }

  // Value extraction and resource creation
  const createdObservations: ExtendedObservation[] = [];
  for (const templateId in debugInfo.fieldMapping.mappedFields) {
    const mapping = debugInfo.fieldMapping.mappedFields[templateId];
    if (!mapping.itemLinkId) continue;
    // Find the template
    const template = observationTemplates.find((t: any) => t.id === mapping.templateId);
    if (!template) continue;
    // Extract value from response using the found linkId
    const value = getNestedAnswerValue(questionnaireResponse, mapping.itemLinkId);
    debugInfo.valueProcessing.values[mapping.templateId] = value;
    const obsValue = debugInfo.valueProcessing.values[mapping.templateId];
    if (obsValue === undefined) continue;
    // Create a new Observation resource based on the template
    const newObs: ExtendedObservation = {
      ...template,
      id: undefined, // Remove template id
      valueQuantity: obsValue !== undefined ? { value: obsValue } : undefined
    };
    createdObservations.push(newObs);
    debugInfo.resultGeneration.observations.push(newObs);
  }

  // Return a Bundle if multiple Observations, or a single resource
  let result: any = null;
  if (createdObservations.length === 1) {
    result = createdObservations[0];
  } else if (createdObservations.length > 1) {
    result = {
      resourceType: 'Bundle',
      type: 'collection',
      entry: createdObservations.map(obs => ({ resource: obs }))
    };
  }

  return {
    result,
    debugInfo
  };
}
