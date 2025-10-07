import type { Questionnaire, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';
import type { RendererStyling } from '../stores';
import {
  questionnaireResponseStore,
  questionnaireStore,
  rendererStylingStore,
  smartConfigStore,
  terminologyServerStore
} from '../stores';
import { initialiseQuestionnaireResponse } from './initialise';
import { removeEmptyAnswersFromItemRecursive } from './removeEmptyAnswers';
import { readEncounter, readPatient, readUser } from '../api/smartClient';
import type Client from 'fhirclient/lib/Client';
import { updateQuestionnaireResponse } from './genericRecursive';
import { removeInternalRepeatIdsRecursive } from './removeRepeatId';
import type { ComponentType } from 'react';
import type { QItemOverrideComponentProps, SdcUiOverrideComponentProps } from '../interfaces';
import { formUpdateQueueStore } from '../stores/formUpdateQueueStore';

/**
 * Parameters for `buildForm()`.
 */
export interface BuildFormParams {
  /**
   * The Questionnaire resource to be rendered.
   */
  questionnaire: Questionnaire;

  /**
   * An optional pre-populated, draft, or loaded QuestionnaireResponse to initialise the form with.
   * If not provided, an empty QuestionnaireResponse will be created.
   */
  questionnaireResponse?: QuestionnaireResponse;

  /**
   * Whether to apply read-only mode to all items in the form view.
   */
  readOnly?: boolean;

  /**
   * A terminology server URL to fetch terminology data.
   * If available, preferredTerminologyServer SDC extension still takes precedence over this.
   * If not provided, a fallback public Ontoserver terminology server will be used.
   */
  terminologyServerUrl?: string;

  /**
   * Additional key-value pairs of SDC variables and values to feed into the renderer's FhirPathContext.
   * Likely used for passing in data from a pre-population module.
   * Example: `{ 'ObsBodyHeight': <Bundle of height observations> }`.
   */
  additionalContext?: Record<string, any>;

  /**
   * Whether to preserve the current navigation state (e.g. current page in paged forms, current tab in tabbed forms) when rebuilding the form.
   * This is useful when you want to perform re-population or other updates without losing the user's current position in the form.
   */
  preserveNavigationState?: boolean;

  /**
   * Optional renderer styling configurations to have fine-grained control over the styling and behaviour of the renderer.
   */
  rendererConfigOptions?: RendererStyling;

  /**
   * Key-value pairs of React component overrides for specific Questionnaire Items via linkId.
   * Example: `{ 'linkId123': MyCustomComponent }`
   */
  qItemOverrideComponents?: Record<string, ComponentType<QItemOverrideComponentProps>>;

  /**
   * Key-value pairs of React component overrides for SDC UI Controls, as defined in:
   * https://hl7.org/fhir/extensions/ValueSet-questionnaire-item-control.html
   * Example: `{ 'example-code': MyCustomUIComponent }`
   */
  sdcUiOverrideComponents?: Record<string, ComponentType<SdcUiOverrideComponentProps>>;
}

/**
 * Build the form with an initial Questionnaire and an optional filled QuestionnaireResponse.
 * If a QuestionnaireResponse is not provided, an empty QuestionnaireResponse is set as the initial QuestionnaireResponse.
 *
 * The build process also supports:
 * - Applying readOnly mode to all items in the form view
 * - Providing a default terminology server URL (fallbacks to a public Ontoserver instance if not provided)
 * - Passing additional SDC variables into the FhirPathContext (e.g. for pre-population purposes)
 * - Adjusting renderer styling and behaviour via `rendererStylingStore`
 * - Overriding QuestionnaireItem rendering via `qItemOverrideComponents`
 * - Overriding SDC UI controls via `sdcUiOverrideComponents`
 *
 * @param params - {@link BuildFormParams} containing the configuration for building the form
 *
 * @author Sean Fong
 */
export async function buildForm(params: BuildFormParams): Promise<void> {
  const {
    questionnaire,
    questionnaireResponse,
    readOnly = false,
    terminologyServerUrl,
    additionalContext,
    rendererConfigOptions,
    qItemOverrideComponents,
    sdcUiOverrideComponents
  } = params;

  // Destroy previous questionnaire and questionnaireResponse state before building a new one
  if (rendererConfigOptions) {
    rendererStylingStore.getState().setRendererStyling(rendererConfigOptions);
  }

  // Reset terminology server
  if (terminologyServerUrl) {
    terminologyServerStore.getState().setUrl(terminologyServerUrl);
  } else {
    terminologyServerStore.getState().resetUrl();
  }

  // QR is set to undefined here to prevent it from being initialised twice. This is defined like that for backward compatibility purposes.
  await questionnaireStore
    .getState()
    .buildSourceQuestionnaire(
      questionnaire,
      undefined,
      additionalContext,
      terminologyServerUrl,
      readOnly,
      qItemOverrideComponents,
      sdcUiOverrideComponents
    );

  // Initialise an empty questionnaireResponse from a given questionnaire
  // Optionally takes in an existing questionnaireResponse to be initialised
  const initialisedQuestionnaireResponse = initialiseQuestionnaireResponse(
    questionnaire,
    questionnaireResponse
  );

  // Set initialised QuestionnaireResponse as the source response in the store
  questionnaireResponseStore.getState().buildSourceResponse(initialisedQuestionnaireResponse);

  // Enqueue an initial form update to process expressions
  // Important: isInitialUpdate must be set to true
  formUpdateQueueStore.getState().enqueueFormUpdate({
    questionnaireResponse: initialisedQuestionnaireResponse,
    isInitialUpdate: true
  });
}

/**
 * Parameters for `repopulateForm()`.
 */
export interface RepopulateFormParams {
  /**
   * The re-populated QuestionnaireResponse to set as the new source response.
   */
  questionnaireResponse: QuestionnaireResponse;

  /**
   * Optional additional key-value pairs of SDC variables and values to feed into the renderer's FhirPathContext.
   * Useful for pre-population or enriching the context used by calculatedExpressions.
   * Example: `{ 'ObsBloodPressure': <Bundle of BP observations> }`
   */
  additionalContext?: Record<string, any>;
}

/**
 * Re-populate the form with a provided (already filled) QuestionnaireResponse.
 *
 * This function does not modify the Questionnaire state.
 * It replaces the current QuestionnaireResponse state in the store and triggers a form update so that SDC expressions are re-evaluated against the new response.
 *
 * @param params - {@link RepopulateFormParams} containing the configuration for repopulating the form
 *
 * @author Sean Fong
 */
export function repopulateForm(params: RepopulateFormParams): void {
  const { questionnaireResponse, additionalContext } = params;

  // Update additionalContext if provided
  if (additionalContext) {
    questionnaireStore.getState().setAdditionalContext(additionalContext);
  }

  // Set re-populated QuestionnaireResponse as the source response in the store
  questionnaireResponseStore.getState().buildSourceResponse(questionnaireResponse);

  // Enqueue an initial form update to process expressions
  formUpdateQueueStore.getState().enqueueFormUpdate({
    questionnaireResponse: questionnaireResponse
  });
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
  const cleanResponse = removeInternalIdsFromResponse(
    questionnaireStore.getState().sourceQuestionnaire,
    questionnaireResponseStore.getState().updatableResponse
  );
  return structuredClone(cleanResponse);
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

  return updateQuestionnaireResponse(
    questionnaire,
    questionnaireResponse,
    removeEmptyAnswersFromItemRecursive,
    {
      enableWhenIsActivated,
      enableWhenItems,
      enableWhenExpressions
    }
  );
}

/**
 * Remove all instances of item.answer.id from the filled QuestionnaireResponse.
 * These IDs are used internally for rendering repeating items, and can be safely left out of the final response.
 *
 * @author Sean Fong
 */
export function removeInternalIdsFromResponse(
  questionnaire: Questionnaire,
  questionnaireResponse: QuestionnaireResponse
): QuestionnaireResponse {
  const questionnaireResponseToUpdate = structuredClone(questionnaireResponse);

  return updateQuestionnaireResponse(
    questionnaire,
    questionnaireResponseToUpdate,
    removeInternalRepeatIdsRecursive,
    undefined
  );
}

/**
 * Check if a QuestionnaireResponseItem has either an item or an answer property.
 *
 * @author Sean Fong
 */
export function qrItemHasItemsOrAnswer(qrItem: QuestionnaireResponseItem): boolean {
  return (!!qrItem.item && qrItem.item.length > 0) || (!!qrItem.answer && qrItem.answer.length > 0);
}
