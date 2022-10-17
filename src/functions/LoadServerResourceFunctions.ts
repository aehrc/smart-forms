import { Bundle, Questionnaire, QuestionnaireResponse } from 'fhir/r5';
import { client } from 'fhirclient';
import Client from 'fhirclient/lib/Client';

/**
 * Sends a request to forms server to obtain the first ten questionnaires that fufills the parameters provided
 *
 * @author Sean Fong
 */
export async function loadQuestionnairesFromServer(params?: string): Promise<Bundle> {
  const formsServerUrl = 'https://sqlonfhir-r4.azurewebsites.net/fhir/';
  const urlParams = params ? params : '';

  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json+fhir; charset=UTF-8',
    Accept: 'application/json+fhir; charset=utf-8'
  };

  return client(formsServerUrl).request({
    url: 'Questionnaire?_count=10&' + urlParams,
    method: 'GET',
    headers: headers
  });
}

/**
 * Sends a request to client CMS to obtain the questionnaireResponses with a given questionnaire context
 * TODO add patient context
 *
 * @author Sean Fong
 */
export async function loadQuestionnaireResponsesFromServer(
  client: Client,
  questionnaireId: string
): Promise<Bundle> {
  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json+fhir; charset=UTF-8',
    Accept: 'application/json+fhir; charset=utf-8'
  };

  return client.request({
    url: `QuestionnaireResponse?questionnaire=${questionnaireId}`,
    method: 'GET',
    headers: headers
  });
}

/**
 * Obtains an array of questionnaires from a bundle of questionnaires
 *
 * @author Sean Fong
 */
export function getQuestionnairesFromBundle(bundle: Bundle): Questionnaire[] {
  if (!bundle.entry) return [];

  return bundle.entry.reduce((mapping: Questionnaire[], entry, i) => {
    if (entry.resource?.resourceType === 'Questionnaire') {
      mapping[i] = entry.resource as unknown as Questionnaire;
    }
    return mapping;
  }, []);
}

/**
 * Obtains an array of questionnaireResponses from a bundle of questionnaireResponses
 *
 * @author Sean Fong
 */
export function getQResponsesFromBundle(bundle: Bundle): QuestionnaireResponse[] {
  if (!bundle.entry) return [];

  return bundle.entry.reduce((mapping: QuestionnaireResponse[], entry, i) => {
    if (entry.resource?.resourceType === 'QuestionnaireResponse') {
      mapping[i] = entry.resource as unknown as QuestionnaireResponse;
    }
    return mapping;
  }, []);
}
