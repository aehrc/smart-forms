import type {
  Extension,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  Observation
} from 'fhir/r4';
import { createBloodPressureObservations } from '../templates/bloodPressureTemplate';

const FHIR_TEMPLATE_EXTRACT_EXTENSION =
  'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract';

const FHIR_TEMPLATE_REFERENCE_EXTENSION =
  'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateReference';

interface VitalSignTemplate {
  type: string;
  requiredCodes: string[]; // LOINC codes that must be present
  requiredLinkIds?: string[]; // Optional linkIds that must be present
  createObservations: (values: Record<string, number>, subjectRef: string) => Observation[];
}

const vitalSignTemplates: VitalSignTemplate[] = [
  {
    type: 'blood-pressure',
    requiredCodes: ['8480-6', '8462-4'], // Systolic and Diastolic BP
    requiredLinkIds: ['systolic', 'diastolic'],
    createObservations: (values, subjectRef) => 
      createBloodPressureObservations(values['8480-6'], values['8462-4'], subjectRef)
  },
  // Add more templates here for other vital signs
  // Example for heart rate:
  // {
  //   type: 'heart-rate',
  //   requiredCodes: ['8867-4'],
  //   createObservations: (values, subjectRef) => createHeartRateObservation(values['8867-4'], subjectRef)
  // }
];

/**
 * Determines if a questionnaire matches any vital sign template
 */
function findMatchingTemplate(questionnaire: Questionnaire): VitalSignTemplate | null {
  if (!questionnaire.item) return null;

  for (const template of vitalSignTemplates) {
    const hasAllRequiredCodes = template.requiredCodes.every(code => 
      questionnaire.item?.some(item => 
        item.code?.some(c => c.code === code)
      )
    );

    const hasAllRequiredLinkIds = !template.requiredLinkIds || 
      template.requiredLinkIds.every(linkId => 
        questionnaire.item?.some(item => item.linkId === linkId)
      );

    if (hasAllRequiredCodes && hasAllRequiredLinkIds) {
      return template;
    }
  }

  return null;
}

interface DebugInfo {
  contentAnalysis?: {
    detectedSigns?: string[];
    confidence?: string;
    patterns?: string[];
  };
  fieldMapping?: {
    mappedFields: Record<string, {
      linkId: string;
      text?: string;
      type?: string;
    } | null>;
    assumptions?: string[];
    alternatives?: string[];
  };
  valueProcessing?: {
    values: Record<string, any>;
    transformations?: string[];
    qualityChecks?: Array<{
      check: string;
      passed: boolean;
      message: string;
    }>;
    rawAnswers?: Record<string, any>;
    subjectReference?: string;
  };
  resultGeneration?: {
    warnings?: string[];
    missingValues?: Record<string, boolean>;
    observations?: Observation[];
    inputValues?: Record<string, any>;
  };
}

export async function extractTemplateBased(
  questionnaire: Questionnaire,
  response: QuestionnaireResponse
): Promise<{ result: Observation[] | null; error: string | null; debugInfo: DebugInfo }> {
  const debugInfo: DebugInfo = {};

  // Content Analysis Stage
  debugInfo.contentAnalysis = {
    detectedSigns: [],
    patterns: []
  };

  // Check for blood pressure related content
  const hasBloodPressureContent = questionnaire.item?.some(item => 
    item.text?.toLowerCase().includes('blood pressure') ||
    item.text?.toLowerCase().includes('bp') ||
    item.text?.toLowerCase().includes('systolic') ||
    item.text?.toLowerCase().includes('diastolic')
  );

  if (hasBloodPressureContent) {
    debugInfo.contentAnalysis.detectedSigns?.push('Blood Pressure');
    debugInfo.contentAnalysis.confidence = 'High';
    debugInfo.contentAnalysis.patterns?.push('Vital signs measurement');
  }

  // Field Mapping Stage
  const findNestedItem = (items: QuestionnaireItem[] | undefined, linkId: string): QuestionnaireItem | undefined => {
    if (!items) return undefined;
    for (const item of items) {
      if (item.linkId === linkId) return item;
      if (item.item) {
        const found = findNestedItem(item.item, linkId);
        if (found) return found;
      }
    }
    return undefined;
  };

  const systolicItem = findNestedItem(questionnaire.item, 'systolic');
  const diastolicItem = findNestedItem(questionnaire.item, 'diastolic');

  debugInfo.fieldMapping = {
    mappedFields: {
      systolic: systolicItem ? {
        linkId: systolicItem.linkId,
        text: systolicItem.text,
        type: systolicItem.type
      } : null,
      diastolic: diastolicItem ? {
        linkId: diastolicItem.linkId,
        text: diastolicItem.text,
        type: diastolicItem.type
      } : null
    },
    assumptions: [],
    alternatives: []
  };

  // Value Processing Stage
  debugInfo.valueProcessing = {
    values: {},
    transformations: [],
    qualityChecks: [],
    rawAnswers: {},
    subjectReference: undefined
  };

  if (hasBloodPressureContent && debugInfo.fieldMapping?.mappedFields.systolic && debugInfo.fieldMapping?.mappedFields.diastolic) {
    const findNestedResponseItem = (items: QuestionnaireResponseItem[] | undefined, linkId: string): QuestionnaireResponseItem | undefined => {
      if (!items) return undefined;
      for (const item of items) {
        if (item.linkId === linkId) return item;
        if (item.item) {
          const found = findNestedResponseItem(item.item, linkId);
          if (found) return found;
        }
      }
      return undefined;
    };

    const systolicAnswer = findNestedResponseItem(response.item, 'systolic')?.answer?.[0];
    const diastolicAnswer = findNestedResponseItem(response.item, 'diastolic')?.answer?.[0];

    // Add debug info for raw answers
    (debugInfo.valueProcessing as any).rawAnswers = {
      systolic: systolicAnswer,
      diastolic: diastolicAnswer
    };

    const extractNumericValue = (answer: any, fieldName: string): number | undefined => {
      if (!answer) {
        (debugInfo.valueProcessing as any).qualityChecks?.push({
          check: `${fieldName} answer presence`,
          passed: false,
          message: `No answer found for ${fieldName}`
        });
        return undefined;
      }
      
      // Try all possible numeric value fields
      const possibleValues = [
        { type: 'valueQuantity', value: answer.valueQuantity?.value },
        { type: 'valueInteger', value: answer.valueInteger },
        { type: 'valueDecimal', value: answer.valueDecimal }
      ];
      
      for (const { type, value } of possibleValues) {
        if (value === undefined || value === null) continue;
        
        if (typeof value === 'number') {
          (debugInfo.valueProcessing as any).qualityChecks?.push({
            check: `${fieldName} value type`,
            passed: true,
            message: `Found ${type} with value ${value}`
          });
          return value;
        }
        if (typeof value === 'string') {
          const numericValue = parseFloat(value);
          if (!isNaN(numericValue)) {
            (debugInfo.valueProcessing as any).qualityChecks?.push({
              check: `${fieldName} value type`,
              passed: true,
              message: `Converted ${type} string "${value}" to number ${numericValue}`
            });
            return numericValue;
          }
        }
      }
      
      (debugInfo.valueProcessing as any).qualityChecks?.push({
        check: `${fieldName} value extraction`,
        passed: false,
        message: `Could not extract numeric value from ${fieldName} answer`
      });
      return undefined;
    };

    const systolicValue = extractNumericValue(systolicAnswer, 'systolic');
    const diastolicValue = extractNumericValue(diastolicAnswer, 'diastolic');

    if (systolicValue !== undefined) {
      debugInfo.valueProcessing.values.systolic = systolicValue;
    }
    if (diastolicValue !== undefined) {
      debugInfo.valueProcessing.values.diastolic = diastolicValue;
    }

    if (systolicValue !== undefined && diastolicValue !== undefined) {
      debugInfo.valueProcessing.qualityChecks?.push({
        check: 'Value types',
        passed: true,
        message: 'Both values are valid numbers'
      });

      const subjectReference = response.subject?.reference || 'Patient/unknown';
      debugInfo.valueProcessing.subjectReference = subjectReference;
      
      // Get LOINC codes from questionnaire items
      const systolicCode = systolicItem?.code?.find(c => c.system === 'http://loinc.org')?.code || '8480-6';
      const diastolicCode = diastolicItem?.code?.find(c => c.system === 'http://loinc.org')?.code || '8462-4';
      
      const observations = createBloodPressureObservations(
        systolicValue,
        diastolicValue,
        subjectReference
      );
      
      // Initialize resultGeneration
      debugInfo.resultGeneration = {
        warnings: observations.length === 2 ? [] : ['Unexpected number of observations generated'],
        observations: observations,
        inputValues: {
          systolic: systolicValue,
          diastolic: diastolicValue,
          subjectReference: subjectReference,
          codes: {
            systolic: systolicCode,
            diastolic: diastolicCode
          }
        }
      };

      // Verify observation values
      observations.forEach((obs, index) => {
        const type = index === 0 ? 'systolic' : 'diastolic';
        const expectedValue = type === 'systolic' ? systolicValue : diastolicValue;
        const actualValue = obs.valueQuantity?.value;
        
        if (actualValue !== expectedValue) {
          (debugInfo.resultGeneration as any).warnings?.push(
            `${type} observation value mismatch: expected ${expectedValue}, got ${actualValue}`
          );
        }
      });
      
      return { result: observations, error: null, debugInfo };
    } else {
      debugInfo.resultGeneration = {
        warnings: ['Missing or invalid blood pressure values'],
        missingValues: {
          systolic: systolicValue === undefined,
          diastolic: diastolicValue === undefined
        }
      };
      return { result: null, error: 'Missing or invalid blood pressure values', debugInfo };
    }
  }

  debugInfo.resultGeneration = {
    warnings: ['No valid blood pressure measurements found']
  };
  return { result: null, error: 'No valid blood pressure measurements found', debugInfo };
}

export type TemplateExtractable = {
  extractable: boolean;
  templateReference?: string;
};

function extractTemplateBasedRecursive(
  qItem: QuestionnaireItem,
  qrItemOrItems: QuestionnaireResponseItem | QuestionnaireResponseItem[] | null,
  extraData?: { qr: QuestionnaireResponse; qItemMap: Record<string, TemplateExtractable> }
): any {
  if (!extraData?.qr || !extraData?.qItemMap) return null;

  const currentQItemTemplate = extraData.qItemMap[qItem.linkId];
  if (!currentQItemTemplate.extractable) return null;

  // TODO: Implement template-based extraction logic
  // This would involve:
  // 1. Loading the template from the reference
  // 2. Mapping questionnaire answers to template fields
  // 3. Applying template transformations
  // 4. Generating the final output

  return null;
}

export function mapQItemsTemplate(questionnaire: Questionnaire): Record<string, TemplateExtractable> {
  if (!questionnaire.item || questionnaire.item.length === 0) {
    return {};
  }

  const initialExtension = questionnaire.extension?.find(
    (e) => e.url === FHIR_TEMPLATE_EXTRACT_EXTENSION
  );

  const templateReference = questionnaire.extension?.find(
    (e) => e.url === FHIR_TEMPLATE_REFERENCE_EXTENSION
  )?.valueString;

  const initialTemplateMap: Record<string, TemplateExtractable> = {
    [questionnaire.id ?? 'root']: {
      extractable: initialExtension?.valueBoolean ?? false,
      templateReference
    }
  };

  transverseQuestionnaire(questionnaire, mapQItemsTemplateRecursive, initialTemplateMap);

  return initialTemplateMap;
}

function mapQItemsTemplateRecursive(
  qItem: QuestionnaireItem,
  root?: Questionnaire,
  parent?: QuestionnaireItem,
  qItemTemplateMap?: Record<string, TemplateExtractable>
): void {
  if (!qItemTemplateMap) return;

  if (!qItemTemplateMap[qItem.linkId]) {
    qItemTemplateMap[qItem.linkId] = { extractable: false };
  }

  // Check if questionnaire extractable
  const extension = qItem.extension?.find((e: Extension) => e.url === FHIR_TEMPLATE_EXTRACT_EXTENSION);
  const templateReference = qItem.extension?.find(
    (e: Extension) => e.url === FHIR_TEMPLATE_REFERENCE_EXTENSION
  )?.valueString;

  if (extension?.valueBoolean || extension?.valueBoolean === false) {
    qItemTemplateMap[qItem.linkId].extractable = extension?.valueBoolean ?? false;
  } else if (parent && qItemTemplateMap[parent.linkId]) {
    qItemTemplateMap[qItem.linkId].extractable = qItemTemplateMap[parent.linkId].extractable;
  } else if (root && qItemTemplateMap[root.id ?? 'root']) {
    qItemTemplateMap[qItem.linkId].extractable = qItemTemplateMap[root?.id ?? 'root'].extractable;
  } else {
    qItemTemplateMap[qItem.linkId].extractable = false;
  }

  if (templateReference) {
    qItemTemplateMap[qItem.linkId].templateReference = templateReference;
  }

  if (qItem.item && qItem.item.length !== 0) {
    for (const qChildItem of qItem.item) {
      mapQItemsTemplateRecursive(qChildItem, root, qItem, qItemTemplateMap);
    }
  }
}

function transverseQuestionnaire(
  questionnaire: Questionnaire,
  callback: (
    qItem: QuestionnaireItem,
    root?: Questionnaire,
    parent?: QuestionnaireItem,
    qItemTemplateMap?: Record<string, TemplateExtractable>
  ) => void,
  qItemTemplateMap?: Record<string, TemplateExtractable>
): void {
  if (!questionnaire.item) return;

  for (const item of questionnaire.item) {
    callback(item, questionnaire, undefined, qItemTemplateMap);
    if (item.item) {
      for (const childItem of item.item) {
        callback(childItem, questionnaire, item, qItemTemplateMap);
      }
    }
  }
} 