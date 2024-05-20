import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { questionnaireResponseStore, questionnaireStore } from '../stores';
import { initialiseQuestionnaireResponse } from './initialise';
import { removeEmptyAnswers } from './removeEmptyAnswers';

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

  const initialisedQuestionnaireResponse = initialiseQuestionnaireResponse(
    questionnaire,
    questionnaireResponse
  );
  questionnaireResponseStore.getState().buildSourceResponse(initialisedQuestionnaireResponse);
  questionnaireStore.getState().updatePopulatedProperties(initialisedQuestionnaireResponse);
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
 * This takes into account enableWhens, enableWhenExpressions, items without item.answer, empty item.answer arrays and empty strings.
 *
 * @author Sean Fong
 */
export function removeEmptyAnswersFromResponse(
  questionnaire: Questionnaire,
  questionnaireResponse: QuestionnaireResponse
): QuestionnaireResponse {
  const enableWhenIsActivated = questionnaireStore.getState().enableWhenIsActivated;
  const enableWhenItems = questionnaireStore.getState().enableWhenItems;
  const enableWhenExpressions = questionnaireStore.getState().enableWhenExpressions;

  return removeEmptyAnswers({
    questionnaire,
    questionnaireResponse,
    enableWhenIsActivated,
    enableWhenItems,
    enableWhenExpressions
  });
}
