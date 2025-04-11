import type { Questionnaire, QuestionnaireResponse, Observation } from 'fhir/r4';
import { extractTemplateObservations } from './templateValidationUtils';
import { saveDebugData } from './debugUtils';
import { findTemplateProcessor } from './templateProcessors';

export interface TemplateProcessingError {
  code: string;
  message: string;
  details?: any;
}

export interface TemplateProcessingResult {
  observations: Observation[];
  errors?: TemplateProcessingError[];
}

export async function processTemplateObservations(
  questionnaire: Questionnaire,
  questionnaireResponse: QuestionnaireResponse
): Promise<TemplateProcessingResult> {
  const errors: TemplateProcessingError[] = [];
  const observations: Observation[] = [];

  try {
    // Save input data
    saveDebugData({
      questionnaire,
      questionnaireResponse
    }, 'template_observations_input');

    // Extract templates from questionnaire
    const templateResult = extractTemplateObservations(questionnaire);
    
    // Save template extraction result
    saveDebugData(templateResult, 'template_extraction_result');
    
    if (!templateResult.isValid) {
      errors.push({
        code: 'TEMPLATE_EXTRACTION_ERROR',
        message: templateResult.error?.message || 'Failed to extract templates'
      });
      return { observations, errors };
    }

    if (!templateResult.templates) {
      errors.push({
        code: 'NO_TEMPLATES',
        message: 'No templates found in questionnaire'
      });
      return { observations, errors };
    }

    // Find appropriate template processor
    const processor = findTemplateProcessor(questionnaire);
    if (!processor) {
      errors.push({
        code: 'NO_PROCESSOR',
        message: 'No template processor found for this questionnaire'
      });
      return { observations, errors };
    }

    // Process templates using the appropriate processor
    const processedObservations = await processor.process(questionnaire, questionnaireResponse);
    observations.push(...processedObservations);

    // Save final result
    saveDebugData({
      observations,
      errors: errors.length > 0 ? errors : undefined
    }, 'template_observations_output');

    return {
      observations,
      errors: errors.length > 0 ? errors : undefined
    };

  } catch (error) {
    errors.push({
      code: 'PROCESSING_ERROR',
      message: 'Error while processing template observations',
      details: error
    });

    // Save error data
    saveDebugData({
      error: errors[0],
      questionnaire,
      questionnaireResponse
    }, 'template_observations_error');

    return { observations, errors };
  }
} 