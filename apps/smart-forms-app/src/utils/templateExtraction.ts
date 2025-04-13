import { Questionnaire, QuestionnaireResponse, Bundle } from 'fhir/r4';
import { bloodPressureTemplate, createBloodPressureObservations } from '@aehrc/smart-forms-renderer/src/templates/bloodPressureTemplate';

/**
 * Gets the appropriate template for a questionnaire based on its type or extensions
 */
export async function getTemplateForQuestionnaire(questionnaire: Questionnaire): Promise<any | null> {
  // Check for template extension
  const templateExtension = questionnaire.extension?.find(
    ext => ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-template'
  );

  if (templateExtension?.valueString) {
    // Load template from the specified URL or identifier
    return await loadTemplate(templateExtension.valueString);
  }

  // Check questionnaire type or identifier
  if (questionnaire.identifier?.some(id => id.value === 'blood-pressure-questionnaire')) {
    return bloodPressureTemplate;
  }

  // Add more type-based template mappings as needed
  return null;
}

/**
 * Loads a template from a given identifier or URL
 */
async function loadTemplate(templateId: string): Promise<any> {
  // For now, we only support the blood pressure template
  if (templateId === 'blood-pressure') {
    return bloodPressureTemplate;
  }

  throw new Error(`Template ${templateId} not found`);
}

/**
 * Extracts data from a questionnaire using a template
 */
export async function extractWithTemplate(
  questionnaire: Questionnaire,
  template: any,
  questionnaireResponse: any
): Promise<any> {
  if (template === bloodPressureTemplate) {
    // Extract systolic and diastolic values from the questionnaire response
    const systolicItem = questionnaireResponse.item?.find(
      (item: any) => item.linkId === 'systolic'
    );
    const diastolicItem = questionnaireResponse.item?.find(
      (item: any) => item.linkId === 'diastolic'
    );

    if (!systolicItem?.answer?.[0]?.valueQuantity?.value || 
        !diastolicItem?.answer?.[0]?.valueQuantity?.value) {
      throw new Error('Missing systolic or diastolic blood pressure values');
    }

    const systolicValue = systolicItem.answer[0].valueQuantity.value;
    const diastolicValue = diastolicItem.answer[0].valueQuantity.value;
    const subjectReference = questionnaireResponse.subject?.reference;

    if (!subjectReference) {
      throw new Error('Missing subject reference');
    }

    return createBloodPressureObservations(systolicValue, diastolicValue, subjectReference);
  }

  throw new Error('Unsupported template type');
}

export async function extractTemplate(
  _questionnaire: Questionnaire,
  _response: QuestionnaireResponse
): Promise<Bundle | null> {
  return null; // TODO: Implement template extraction
}

export function isBloodPressureTemplate(_questionnaire: Questionnaire): boolean {
  return true; // TODO: Implement template detection
} 