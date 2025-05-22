import { buildForm, destroyForm } from '@aehrc/smart-forms-renderer';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

export async function buildFormWrapper(
  questionnaire: Questionnaire,
  questionnaireResponse?: QuestionnaireResponse,
  readOnly?: boolean,
  terminologyServerUrl?: string,
  additionalVariables?: Record<string, object>
) {
  return buildForm(
    questionnaire,
    questionnaireResponse,
    readOnly,
    terminologyServerUrl,
    additionalVariables
  );
}

export function destroyFormWrapper() {
  return destroyForm();
}
