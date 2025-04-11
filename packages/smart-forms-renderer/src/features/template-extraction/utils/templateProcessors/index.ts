import { Questionnaire, QuestionnaireResponse, Observation } from 'fhir/r4';
import { processCalculatedExpressionBMITemplate } from './calculatedExpressionBMIProcessor';
import { validateBMITemplate, isBMITemplate } from '../templateValidationUtils';
import { bloodPressureProcessor } from './bloodPressureProcessor';

/**
 * Interface for template processors
 */
export interface TemplateProcessor {
  canProcess: (questionnaire: Questionnaire) => boolean;
  process: (questionnaire: Questionnaire, response: QuestionnaireResponse) => Promise<Observation[]>;
}

/**
 * List of available template processors
 */
export const processors: TemplateProcessor[] = [
  bloodPressureProcessor,
  {
    canProcess: (questionnaire: Questionnaire): boolean => {
      // First check if it's a BMI template
      if (!isBMITemplate(questionnaire)) {
        return false;
      }
      // Only validate if it's a BMI template
      const validationResult = validateBMITemplate(questionnaire);
      return validationResult.isValid;
    },
    process: async (questionnaire: Questionnaire, response: QuestionnaireResponse): Promise<Observation[]> => {
      const result = await processCalculatedExpressionBMITemplate(questionnaire, response);
      return result.observations;
    }
  }
];

/**
 * Find a processor for the given questionnaire
 * @param questionnaire The questionnaire to process
 * @returns The appropriate processor or undefined if none found
 */
export function findTemplateProcessor(questionnaire: Questionnaire): TemplateProcessor | undefined {
  return processors.find(processor => processor.canProcess(questionnaire));
} 