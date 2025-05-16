import { InputParameters } from '../interfaces/inputParameters.interface';
import { OutputParameters } from '../interfaces/outputParameters.interface';
import type { DebugInfo, ExtendedObservation } from '../types';
import { getNestedAnswerValue } from '../utils';
import {
  FetchResourceCallback,
  FetchResourceRequestConfig
} from '../interfaces/callback.interface';
import type { OperationOutcome, QuestionnaireResponse } from 'fhir/r4';
import { getQuestionnaireResponse } from './getQuestionnaireResponse';
import { fetchQuestionnaire } from './fetchQuestionnaire';
import { createErrorOutcome, createInvalidWarningIssue } from './operationOutcome';
import { collectExtractTemplates } from './extractTemplate';

export async function extract(
  parameters: InputParameters | QuestionnaireResponse,
  fetchResourceCallback: FetchResourceCallback,
  fetchResourceRequestConfig: FetchResourceRequestConfig
): Promise<OutputParameters | OperationOutcome> {
  // Get QuestionnaireResponse from input parameters
  const questionnaireResponse = getQuestionnaireResponse(parameters);
  if (questionnaireResponse.resourceType === 'OperationOutcome') {
    // Return as FHIR OperationOutcome
    return questionnaireResponse;
  }

  // Get Questionnaire from input parameters or from QuestionnaireResponse.questionnaire
  const questionnaire = await fetchQuestionnaire(
    parameters,
    questionnaireResponse,
    fetchResourceCallback,
    fetchResourceRequestConfig
  );
  if (questionnaire.resourceType === 'OperationOutcome') {
    // Return as FHIR OperationOutcome
    return questionnaire;
  }

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
  if (!questionnaire.item || questionnaire.item.length === 0) {
    return createErrorOutcome(`Questionnaire.item is empty, there are no items to process`);
  }

  if (!questionnaire.contained || questionnaire.contained.length === 0) {
    return createErrorOutcome(
      `Questionnaire.contained is empty, an extraction template should be provided as a contained resource`
    );
  }

  if (!questionnaireResponse.item || questionnaireResponse.item.length === 0) {
    return createErrorOutcome(
      `QuestionnaireResponse.item is empty, there are no answers to process`
    );
  }

  // Get extract templates from questionnaire and all its items
  const { extractTemplateMap, extractTemplateWarnings } = collectExtractTemplates(questionnaire);
  if (extractTemplateMap.size === 0) {
    return {
      resourceType: 'OperationOutcome',
      issue: [
        createInvalidWarningIssue(
          'No "sdc-questionnaire-templateExtract" extension found in the questionnaire, skipping extraction'
        )
      ]
    };
  }

  // TODO Refactored up to this point

  // Template analysis and field mapping
  const templates = q.contained;
  debugInfo.contentAnalysis.detectedTemplates = templates.map((t: any) => t.id || 'unnamed');

  // For now, only handle Observation templates
  const observationTemplates = templates.filter((t: any) => t.resourceType === 'Observation');

  // Log the contained templates
  console.log('Contained templates:', templates);
  // Log the questionnaire items
  console.log('Questionnaire items:', q.item);

  debugInfo.fieldMapping.mappedFields = observationTemplates.reduce(
    (acc: Record<string, any>, template: any) => {
      const code = template.code?.coding?.[0]?.code;
      const item = findMatchingResponseItem(
        questionnaireResponse.item ?? [],
        template,
        code,
        template.id
      );
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
    },
    {}
  );

  // Add relevant assumptions about the mapping
  if (Object.keys(debugInfo.fieldMapping.mappedFields).length === 0) {
    debugInfo.fieldMapping.assumptions.push(
      'No fields could be mapped between templates and questionnaire items'
    );
  } else {
    debugInfo.fieldMapping.assumptions.push(
      `Successfully mapped ${Object.keys(debugInfo.fieldMapping.mappedFields).length} fields`
    );
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
      entry: createdObservations.map((obs) => ({ resource: obs }))
    };
  }

  return {
    result,
    debugInfo
  };
}
