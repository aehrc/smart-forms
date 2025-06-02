import { buildForm, destroyForm, questionnaireStore } from '@aehrc/smart-forms-renderer';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { fetchTargetStructureMap } from '../features/playground/api/extract.ts';
import { extractDebuggerStore } from '../features/playground/stores/extractDebuggerStore.ts';

export async function buildFormWrapper(
  questionnaire: Questionnaire,
  questionnaireResponse?: QuestionnaireResponse,
  readOnly?: boolean,
  terminologyServerUrl?: string,
  additionalVariables?: Record<string, object>
) {
  extractDebuggerStore.getState().resetStore();
  const targetStructureMap = await fetchTargetStructureMap(questionnaire);
  if (targetStructureMap) {
    extractDebuggerStore.getState().setStructuredMapExtractMap(targetStructureMap);
  }

  // Destroy previous questionnaire state before building a new one
  questionnaireStore.getState().destroySourceQuestionnaire();

  return buildForm(
    questionnaire,
    questionnaireResponse,
    readOnly,
    terminologyServerUrl,
    additionalVariables
  );
}

export function destroyFormWrapper() {
  extractDebuggerStore.getState().resetStore();
  return destroyForm();
}
