import { buildForm, destroyForm } from '@aehrc/smart-forms-renderer';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { fetchTargetStructureMap } from '../features/playground/api/extract.ts';
import { extractOperationStore } from '../features/playground/stores/extractOperationStore.ts';

export async function buildFormWrapper(
  questionnaire: Questionnaire,
  questionnaireResponse?: QuestionnaireResponse,
  readOnly?: boolean,
  terminologyServerUrl?: string,
  additionalVariables?: Record<string, object>
) {
  extractOperationStore.getState().resetStore();
  const targetStructureMap = await fetchTargetStructureMap(questionnaire);
  if (targetStructureMap) {
    extractOperationStore.getState().setTargetStructureMap(targetStructureMap);
  }

  return buildForm(
    questionnaire,
    questionnaireResponse,
    readOnly,
    terminologyServerUrl,
    additionalVariables
  );
}

export function destroyFormWrapper() {
  extractOperationStore.getState().resetStore();
  return destroyForm();
}
