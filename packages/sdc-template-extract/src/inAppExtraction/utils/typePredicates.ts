import type {
  ExtractResult,
  FetchQuestionnaireResolver,
  QuestionnaireOrCallback
} from '../interfaces';
import type { OperationOutcome, Questionnaire } from 'fhir/r4';
import type { TemplateExtractDebugInfo } from '../../SDCExtractQuestionnaireResponseOperation';

export function questionnaireOrCallbackIsFetchQuestionnaireResolver(
  questionnaireOrCallback: QuestionnaireOrCallback
): questionnaireOrCallback is FetchQuestionnaireResolver {
  return (
    typeof questionnaireOrCallback === 'object' &&
    questionnaireOrCallback !== null &&
    'fetchQuestionnaireCallback' in questionnaireOrCallback &&
    'fetchQuestionnaireRequestConfig' in questionnaireOrCallback
  );
}

export function questionnaireOrCallbackIsQuestionnaire(
  questionnaireOrCallback: QuestionnaireOrCallback
): questionnaireOrCallback is Questionnaire {
  return (
    typeof questionnaireOrCallback === 'object' &&
    questionnaireOrCallback !== null &&
    'resourceType' in questionnaireOrCallback &&
    questionnaireOrCallback.resourceType === 'Questionnaire'
  );
}

export function extractResultIsOperationOutcome(
  extractResult: ExtractResult | OperationOutcome
): extractResult is OperationOutcome {
  return 'resourceType' in extractResult && extractResult.resourceType === 'OperationOutcome';
}

export function objIsTemplateExtractDebugInfo(obj: object): obj is TemplateExtractDebugInfo {
  return typeof obj === 'object' && obj !== null && 'templateIdToExtractPathTuples' in obj;
}
