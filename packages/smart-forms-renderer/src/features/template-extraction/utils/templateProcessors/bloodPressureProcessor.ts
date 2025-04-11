import type { Questionnaire, QuestionnaireResponse, Observation } from 'fhir/r4';
import { validateBloodPressureTemplate, isBloodPressureTemplate } from '../templateValidationUtils';
import { evaluateFhirPath } from '../fhirPathUtils';
import type { TemplateProcessor } from './index';

export const bloodPressureProcessor: TemplateProcessor = {
  canProcess: (questionnaire: Questionnaire): boolean => {
    // First check if it's a blood pressure template
    if (!isBloodPressureTemplate(questionnaire)) {
      return false;
    }
    // Only validate if it's a blood pressure template
    const validationResult = validateBloodPressureTemplate(questionnaire);
    return validationResult.isValid;
  },
  process: async (questionnaire: Questionnaire, response: QuestionnaireResponse): Promise<Observation[]> => {
    const validationResult = validateBloodPressureTemplate(questionnaire);
    if (!validationResult.isValid || !validationResult.templates) {
      return [];
    }

    // Get the systolic and diastolic observations
    const [systolicTemplate, diastolicTemplate] = validationResult.templates;

    // Extract values using FHIRPath
    const systolicValue = systolicTemplate.extension?.find(
      ext => ext.url === 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue'
    )?.valueString;
    const diastolicValue = diastolicTemplate.extension?.find(
      ext => ext.url === 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue'
    )?.valueString;

    if (!systolicValue || !diastolicValue) {
      return [];
    }

    // Evaluate FHIRPath expressions
    const systolicResult = evaluateFhirPath(response, systolicValue);
    const diastolicResult = evaluateFhirPath(response, diastolicValue);

    const observations: Observation[] = [];

    // Create systolic observation if value exists
    if (systolicResult !== undefined) {
      observations.push({
        ...systolicTemplate,
        valueQuantity: {
          value: systolicResult,
          unit: 'mm[Hg]',
          system: 'http://unitsofmeasure.org',
          code: 'mm[Hg]'
        }
      });
    }

    // Create diastolic observation if value exists
    if (diastolicResult !== undefined) {
      observations.push({
        ...diastolicTemplate,
        valueQuantity: {
          value: diastolicResult,
          unit: 'mm[Hg]',
          system: 'http://unitsofmeasure.org',
          code: 'mm[Hg]'
        }
      });
    }

    return observations;
  }
}; 