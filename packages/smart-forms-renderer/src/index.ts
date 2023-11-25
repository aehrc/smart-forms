import questionnaireStore from './stores/questionnaireStore';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { createEmptyQuestionnaireResponse } from './utils/qrItem';
import questionnaireResponseStore from './stores/questionnaireResponseStore';
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
  await questionnaireStore.getState().buildSourceQuestionnaire(questionnaire);

  if (!questionnaireResponse) {
    questionnaireResponseStore
      .getState()
      .buildSourceResponse(createEmptyQuestionnaireResponse(questionnaire));
    return;
  }

  questionnaireResponseStore.getState().buildSourceResponse(questionnaireResponse);
  questionnaireStore.getState().updatePopulatedProperties(questionnaireResponse);
}

/**
 * Destroy the form to clean up the questionnaire and questionnaireResponse stores.
 *
 * @author Sean Fong
 */
export function destroyForm(): void {
  questionnaireStore.getState().destroySourceQuestionnaire();
  questionnaireResponseStore.getState().destroySourceResponse();
}

/**
 * Get the filled QuestionnaireResponse at its current state.
 * If no changes have been made to the form, the initial QuestionnaireResponse is returned.
 *
 * @author Sean Fong
 */
export function getResponse(): QuestionnaireResponse {
  return questionnaireResponseStore.getState().updatableResponse;
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
  const enableWhenIsActivated = questionnaireStore.getState().enableWhenIsActivated;
  const enableWhenItems = questionnaireStore.getState().enableWhenItems;
  const enableWhenExpressions = questionnaireStore.getState().enableWhenExpressions;

  return removeHiddenAnswers({
    questionnaire,
    questionnaireResponse,
    enableWhenIsActivated,
    enableWhenItems,
    enableWhenExpressions
  });
}

/**
 * Compare latest data from the server with the current QuestionnaireResponse and decide items to re-populate.
 *
 * @author Sean Fong
 */
export function generateItemsToRepopulate(populatedResponse: QuestionnaireResponse) {
  const sourceQuestionnaire = questionnaireStore.getState().sourceQuestionnaire;
  const tabs = questionnaireStore.getState().tabs;
  const updatableResponse = questionnaireResponseStore.getState().updatableResponse;
  const enableWhenIsActivated = questionnaireStore.getState().enableWhenIsActivated;
  const enableWhenItems = questionnaireStore.getState().enableWhenItems;
  const enableWhenExpressions = questionnaireStore.getState().enableWhenExpressions;

  return getItemsToRepopulate({
    sourceQuestionnaire,
    tabs,
    populatedResponse,
    updatableResponse,
    enableWhenIsActivated,
    enableWhenItems,
    enableWhenExpressions
  });
}

/**
 * Re-populate checked items in the re-population dialog into the current QuestionnaireResponse.
 *
 * @author Sean Fong
 */
export function repopulateResponse(checkedItemsToRepopulate: Record<string, ItemToRepopulate>) {
  const sourceQuestionnaire = questionnaireStore.getState().sourceQuestionnaire;
  const updatableResponse = questionnaireResponseStore.getState().updatableResponse;

  return repopulateItemsIntoResponse(
    sourceQuestionnaire,
    updatableResponse,
    checkedItemsToRepopulate
  );
}
