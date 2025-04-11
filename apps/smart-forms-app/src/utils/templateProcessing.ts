import { Questionnaire, QuestionnaireResponse, Observation } from 'fhir/r4';
import { processTemplateObservations as processTemplates } from '../../../../packages/smart-forms-renderer/src/features/template-extraction/utils/templateProcessingUtils';

export interface TemplateProcessingResult {
  observations: Observation[];
  errors?: string[];
}

export async function processTemplateObservations(
  questionnaire: Questionnaire,
  questionnaireResponse: QuestionnaireResponse
): Promise<TemplateProcessingResult> {
  const result = await processTemplates(questionnaire, questionnaireResponse);
  return {
    observations: result.observations,
    errors: result.errors?.map(error => error.message)
  };
} 