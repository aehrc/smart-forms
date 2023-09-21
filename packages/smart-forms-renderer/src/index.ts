import useQuestionnaireStore from './stores/useQuestionnaireStore';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { createQuestionnaireResponse } from './utils/qrItem';
import useQuestionnaireResponseStore from './stores/useQuestionnaireResponseStore';
import { removeHiddenAnswers } from './utils/removeHidden';
import type { ItemToRepopulate } from './utils/repopulateItems';
import { getItemsToRepopulate } from './utils/repopulateItems';
import { repopulateItemsIntoResponse } from './utils/repopulateIntoResponse';

export * from './components';
export * from './stores';
export * from './hooks';
export * from './utils';
export type { ItemToRepopulate };

/**
 * Build the form with an initial Questionnaire and an optional filled QuestionnaireResponse.
 * If a QuestionnaireResponse is not provided, an empty QuestionnaireResponse is set as the initial QuestionnaireResponse.
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
 * Destroy the form to clean up the questionnaire and questionnaireResponse stores.
 *
 * @author Sean Fong
 */
export function destroyForm(): void {
  useQuestionnaireStore.getState().destroySourceQuestionnaire();
  useQuestionnaireResponseStore.getState().destroySourceResponse();
}

/**
 * Get the filled QuestionnaireResponse at its current state.
 * If no changes have been made to the form, the initial QuestionnaireResponse is returned.
 *
 * @author Sean Fong
 */
export function getResponse(): QuestionnaireResponse {
  return useQuestionnaireResponseStore.getState().updatableResponse;
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

/**
 * Re-populate stuff
 *
 * @author Sean Fong
 */
export function generateItemsToRepopulate(populatedResponse: QuestionnaireResponse) {
  const sourceQuestionnaire = useQuestionnaireStore.getState().sourceQuestionnaire;
  const itemTypes = useQuestionnaireStore.getState().itemTypes;
  const tabs = useQuestionnaireStore.getState().tabs;
  const updatableResponse = useQuestionnaireResponseStore.getState().updatableResponse;
  console.log(updatableResponse);

  return getItemsToRepopulate(
    sourceQuestionnaire,
    itemTypes,
    tabs,
    populatedResponse,
    updatableResponse
  );
}

/**
 * Re-populate stuff
 *
 * @author Sean Fong
 */
export function repopulate(checkedItemsToRepopulate: Record<string, ItemToRepopulate>) {
  const sourceQuestionnaire = useQuestionnaireStore.getState().sourceQuestionnaire;
  const updatableResponse = useQuestionnaireResponseStore.getState().updatableResponse;

  return repopulateItemsIntoResponse(
    sourceQuestionnaire,
    updatableResponse,
    checkedItemsToRepopulate
  );
}
