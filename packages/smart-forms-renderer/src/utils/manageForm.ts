import type { Questionnaire, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';
import {
  questionnaireResponseStore,
  questionnaireStore,
  smartConfigStore,
  terminologyServerStore
} from '../stores';
import { initialiseQuestionnaireResponse } from './initialise';
import { removeEmptyAnswers } from './removeEmptyAnswers';
import { readEncounter, readPatient, readUser } from '../api/smartClient';
import type Client from 'fhirclient/lib/Client';

/**
 * Build the form with an initial Questionnaire and an optional filled QuestionnaireResponse.
 * If a QuestionnaireResponse is not provided, an empty QuestionnaireResponse is set as the initial QuestionnaireResponse.
 * There are other optional properties such as applying readOnly, providing a terminology server url and additional variables.
 *
 * @param questionnaire - Questionnaire to be rendered
 * @param questionnaireResponse - Pre-populated/draft/loaded QuestionnaireResponse to be rendered (optional)
 * @param readOnly - Applies read-only mode to all items in the form view
 * @param terminologyServerUrl - Terminology server url to fetch terminology. If not provided, the default terminology server will be used. (optional)
 * @param additionalVariables - Additional key-value pair of SDC variables `Record<name, variable extension>` for testing (optional)
 *
 * @author Sean Fong
 */
export async function buildForm(
  questionnaire: Questionnaire,
  questionnaireResponse?: QuestionnaireResponse,
  readOnly?: boolean,
  terminologyServerUrl?: string,
  additionalVariables?: Record<string, object>
): Promise<void> {
  // Reset terminology server
  if (terminologyServerUrl) {
    terminologyServerStore.getState().setUrl(terminologyServerUrl);
  } else {
    terminologyServerStore.getState().resetUrl();
  }

  // QR is set to undefined here to prevent it from being initialised twice. This is defined like that for backward compatibility purposes.
  await questionnaireStore
    .getState()
    .buildSourceQuestionnaire(questionnaire, undefined, additionalVariables, terminologyServerUrl);

  const initialisedQuestionnaireResponse = initialiseQuestionnaireResponse(
    questionnaire,
    questionnaireResponse
  );
  questionnaireResponseStore.getState().buildSourceResponse(initialisedQuestionnaireResponse);
  questionnaireStore.getState().updatePopulatedProperties(initialisedQuestionnaireResponse);

  if (readOnly) {
    questionnaireStore.getState().setFormAsReadOnly(readOnly);
  }
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
 * Initialise the FHIRClient object to make further FHIR calls in the renderer.
 * Note that this does not provide pre-population capabilities.
 *
 * @param fhirClient - FHIRClient object to perform further FHIR calls. At the moment it's only used in answerExpressions
 *
 * @author Sean Fong
 */
export async function initialiseFhirClient(fhirClient: Client): Promise<void> {
  smartConfigStore.getState().setClient(fhirClient);
  const patientPromise = readPatient(fhirClient);
  const userPromise = readUser(fhirClient);
  const encounterPromise = readEncounter(fhirClient);

  const [patient, user, encounter] = await Promise.all([
    patientPromise,
    userPromise,
    encounterPromise
  ]);
  smartConfigStore.getState().setPatient(patient);
  smartConfigStore.getState().setUser(user);
  smartConfigStore.getState().setEncounter(encounter);
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
 * Remove all empty/hidden answers from the filled QuestionnaireResponse.
 * This takes into account enableWhens, enableWhenExpressions, items without item.answer, empty item.answer arrays and empty strings.
 * This does not remove items that are hidden by the http://hl7.org/fhir/StructureDefinition/questionnaire-hidden extension.
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

/**
 * Check if a QuestionnaireResponseItem has either an item or an answer property.
 *
 * @author Sean Fong
 */
export function qrItemHasItemsOrAnswer(qrItem: QuestionnaireResponseItem): boolean {
  return (!!qrItem.item && qrItem.item.length > 0) || (!!qrItem.answer && qrItem.answer.length > 0);
}
