import { Bundle, Questionnaire, QuestionnaireResponse } from 'fhir/r5';
import { client } from 'fhirclient';

export async function loadQuestionnairesFromServer(): Promise<Bundle> {
  const serverUrl = 'http://localhost:8080/fhir/';

  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json+fhir; charset=UTF-8',
    Accept: 'application/json+fhir; charset=utf-8'
  };

  return client(serverUrl).request({
    url: 'Questionnaire',
    method: 'GET',
    headers: headers
  });
}

export async function loadQuestionnaireResponsesFromServer(
  questionnaireId: string
): Promise<Bundle> {
  const serverUrl = 'http://localhost:8080/fhir/';

  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json+fhir; charset=UTF-8',
    Accept: 'application/json+fhir; charset=utf-8'
  };

  return client(serverUrl).request({
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
