import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { questionnaireResponseStore, questionnaireStore } from '../stores';
import { initialiseQuestionnaireResponse } from './initialise';

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
