import { Bundle, Questionnaire, QuestionnaireResponse } from 'fhir/r5';
import { client } from 'fhirclient';
import Client from 'fhirclient/lib/Client';

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

export function getQuestionnairesFromBundle(bundle: Bundle): Questionnaire[] {
  if (!bundle.entry) return [];

  return bundle.entry.reduce((mapping: Questionnaire[], entry, i) => {
    if (entry.resource?.resourceType === 'Questionnaire') {
      mapping[i] = entry.resource as unknown as Questionnaire;
    }
    return mapping;
  }, []);
}

export function getQResponsesFromBundle(bundle: Bundle): QuestionnaireResponse[] {
  if (!bundle.entry) return [];

  return bundle.entry.reduce((mapping: QuestionnaireResponse[], entry, i) => {
    if (entry.resource?.resourceType === 'QuestionnaireResponse') {
      mapping[i] = entry.resource as unknown as QuestionnaireResponse;
    }
    return mapping;
  }, []);
}
