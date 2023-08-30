import useQuestionnaireStore from './stores/useQuestionnaireStore';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { createQuestionnaireResponse } from './utils/qrItem';
import useQuestionnaireResponseStore from './stores/useQuestionnaireResponseStore';
import { removeHiddenAnswers } from './utils/removeHidden';

export * from './components';
export * from './hooks';

export function useSourceQuestionnaire(): Questionnaire {
  return useQuestionnaireStore.getState().sourceQuestionnaire;
}

export function useSourceResponse(): QuestionnaireResponse {
  return useQuestionnaireResponseStore.getState().sourceResponse;
}

export function useUpdatableResponse(): QuestionnaireResponse {
  return useQuestionnaireResponseStore.getState().updatableResponse;
}
export function useFormHasChanges(): boolean {
  return useQuestionnaireResponseStore.getState().hasChanges;
}

export function useEnableWhenActivated(): boolean {
  return useQuestionnaireStore.getState().enableWhenIsActivated;
}

export async function setSourceQuestionnaire(questionnaire: Questionnaire): Promise<void> {
  await useQuestionnaireStore.getState().buildSourceQuestionnaire(questionnaire);
}

export async function buildForm(
  questionnaire: Questionnaire,
  questionnaireResponse?: QuestionnaireResponse
): Promise<void> {
  await useQuestionnaireStore.getState().buildSourceQuestionnaire(questionnaire);

  if (!questionnaireResponse) {
    useQuestionnaireResponseStore
      .getState()
      .buildSourceResponse(createQuestionnaireResponse(questionnaire));
    return;
  }

  useQuestionnaireResponseStore.getState().buildSourceResponse(questionnaireResponse);
  useQuestionnaireStore.getState().updatePopulatedProperties(questionnaireResponse);
}

export function destroyForm(): void {
  useQuestionnaireStore.getState().destroySourceQuestionnaire();
  useQuestionnaireResponseStore.getState().destroySourceResponse();
}

export function setEnableWhenActivation(isActivated: boolean): void {
  useQuestionnaireStore.getState().toggleEnableWhenActivation(isActivated);
}

export function setPopulatedResponse(populatedResponse: QuestionnaireResponse): void {
  const updatedResponse = useQuestionnaireStore
    .getState()
    .updatePopulatedProperties(populatedResponse);
  useQuestionnaireResponseStore.getState().populateResponse(updatedResponse);
}

export function setEmptyResponse(emptyResponse: QuestionnaireResponse): void {
  return useQuestionnaireResponseStore.getState().clearResponse(emptyResponse);
}

export function setSavedResponse(savedResponse: QuestionnaireResponse): void {
  return useQuestionnaireResponseStore.getState().saveResponse(savedResponse);
}

export function removeHiddenAnswersFromResponse(
  questionnaire: Questionnaire,
  questionnaireResponse: QuestionnaireResponse
): QuestionnaireResponse {
  const enableWhenIsActivated = useQuestionnaireStore.getState().enableWhenIsActivated;
  const enableWhenItems = useQuestionnaireStore.getState().enableWhenItems;
  const enableWhenExpressions = useQuestionnaireStore.getState().enableWhenExpressions;

  return removeHiddenAnswers({
    questionnaire,
    questionnaireResponse,
    enableWhenIsActivated,
    enableWhenItems,
    enableWhenExpressions
  });
}
