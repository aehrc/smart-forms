import useQuestionnaireStore from './stores/useQuestionnaireStore';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { createQuestionnaireResponse } from './utils/qrItem';
import useQuestionnaireResponseStore from './stores/useQuestionnaireResponseStore';
import { removeHiddenAnswers } from './utils/removeHidden';

export * from './components';
export * from './hooks';

/**
 * Get the initial Questionnaire.
 *
 * @author Sean Fong
 */
export function useSourceQuestionnaire(): Questionnaire {
  return useQuestionnaireStore.getState().sourceQuestionnaire;
}

/**
 * Get the initial QuestionnaireResponse.
 * An empty QuestionnaireResponse is returned if no initial QuestionnaireResponse is provided when building the form.
 *
 * @author Sean Fong
 */
export function useSourceResponse(): QuestionnaireResponse {
  return useQuestionnaireResponseStore.getState().sourceResponse;
}

/**
 * Get the filled QuestionnaireResponse.
 * If no changes have been made to the form, the initial QuestionnaireResponse is returned.
 *
 * @author Sean Fong
 */
export function useUpdatableResponse(): QuestionnaireResponse {
  return useQuestionnaireResponseStore.getState().updatableResponse;
}

/**
 * Get the boolean value of whether any changes have been made to the form.
 *
 * @author Sean Fong
 */
export function useFormHasChanges(): boolean {
  return useQuestionnaireResponseStore.getState().hasChanges;
}

/**
 * Get the boolean value of whether enableWhen (and enableWhenExpression) is activated.
 *
 * @author Sean Fong
 */
export function useEnableWhenActivated(): boolean {
  return useQuestionnaireStore.getState().enableWhenIsActivated;
}

/**
 * Set the initial Questionnaire.
 * In most cases, <pre>buildForm()</pre> should be used instead.
 *
 * @author Sean Fong
 */
export async function setSourceQuestionnaire(questionnaire: Questionnaire): Promise<void> {
  await useQuestionnaireStore.getState().buildSourceQuestionnaire(questionnaire);
}

/**
 * Build the form with an initial Questionnaire and an optional filled QuestionnaireResponse.
 * If a QuestionnaireResponse is not provided, an empty QuestionnaireResponse is set as the initial QuestionnaireResponse.
 * In most cases, <pre>buildForm()</pre> is sufficient. Other fine-grained functions are provided for more control.
 *
 * @author Sean Fong
 */
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

/**
 * Destroy the form to clean up the store.
 *
 * @author Sean Fong
 */
export function destroyForm(): void {
  useQuestionnaireStore.getState().destroySourceQuestionnaire();
  useQuestionnaireResponseStore.getState().destroySourceResponse();
}

/**
 * Toggle activation of enableWhen (and enableWhenExpression).
 *
 * @author Sean Fong
 */
export function setEnableWhenActivation(isActivated: boolean): void {
  useQuestionnaireStore.getState().toggleEnableWhenActivation(isActivated);
}

/**
 * Set the filled QuestionnaireResponse.
 * In most cases, <pre>buildForm()</pre> should be used instead.
 *
 * @author Sean Fong
 */
export function setUpdatableResponse(populatedResponse: QuestionnaireResponse): void {
  const updatedResponse = useQuestionnaireStore
    .getState()
    .updatePopulatedProperties(populatedResponse);
  useQuestionnaireResponseStore.getState().populateResponse(updatedResponse);
}

/**
 * Set the filled QuestionnaireResponse to be empty.
 * This is used to quickly clear the form.
 *
 * @author Sean Fong
 */
export function setUpdatableResponseAsEmpty(emptyResponse: QuestionnaireResponse): void {
  return useQuestionnaireResponseStore.getState().clearResponse(emptyResponse);
}

/**
 * Save the filled QuestionnaireResponse to be the initial QuestionnaireResponse and reset the <pre>hasChanges</pre> flag.
 *
 * @author Sean Fong
 */
export function setUpdatableResponseAsSaved(savedResponse: QuestionnaireResponse): void {
  return useQuestionnaireResponseStore.getState().saveResponse(savedResponse);
}

/**
 * Remove all hidden answers from the filled QuestionnaireResponse.
 * This takes into account the questionnaire-hidden extension, enableWhens and enableWhenExpressions.
 *
 * @author Sean Fong
 */
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
