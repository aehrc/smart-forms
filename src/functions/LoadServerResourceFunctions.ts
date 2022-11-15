import { Bundle, Patient, Questionnaire, QuestionnaireResponse } from 'fhir/r5';
import { client } from 'fhirclient';
import Client from 'fhirclient/lib/Client';
import Q715 from '../data/resources/715.R4.json';
import Q715Modified from '../data/resources/715.R4-modified.json';
import QAssembled from '../data/resources/Assembled.json';
import QCvdCheck from '../data/resources/CVD Check.json';
import QCvdRisk from '../data/resources/CVD Risk.json';
import QCvdRiskHiso from '../data/resources/CVD Risk-HISO.json';

/**
 * Sends a request to forms server to obtain the first ten questionnaires that fufills the parameters provided
 *
 * @author Sean Fong
 */
export async function loadQuestionnairesFromServer(input?: string): Promise<Bundle> {
  const formsServerUrl = 'https://sqlonfhir-r4.azurewebsites.net/fhir/';
  const urlParams = input ? `title=${input}` : '';

  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json+fhir; charset=UTF-8',
    Accept: 'application/json+fhir; charset=utf-8'
  };

  return client(formsServerUrl).request({
    url: 'Questionnaire?_count=10&_sort=-date&' + urlParams,
    method: 'GET',
    headers: headers
  });
}

/**
 * Sends a request to client CMS to obtain the questionnaireResponses with a given questionnaire context
 *
 * @author Sean Fong
 */
export async function loadQuestionnaireResponsesFromServer(
  client: Client,
  patient: Patient | null,
  questionnaireId?: string
): Promise<Bundle> {
  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json+fhir; charset=UTF-8',
    Accept: 'application/json+fhir; charset=utf-8'
  };

  let requestUrl = 'QuestionnaireResponse?';
  requestUrl += questionnaireId ? `questionnaire=${questionnaireId}&` : '';
  requestUrl += patient ? `patient=${patient.id}&` : '';

  return client.request({
    url: requestUrl,
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

export function loadQuestionnaireFromResponse(
  questionnaireReference: string
): Promise<Questionnaire> {
  const formsServerUrl = 'https://sqlonfhir-r4.azurewebsites.net/fhir/';
  const questionnaireId = questionnaireReference.replace('Questionnaire/', '');

  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json+fhir; charset=UTF-8',
    Accept: 'application/json+fhir; charset=utf-8'
  };

  return client(formsServerUrl).request({
    url: `Questionnaire/${questionnaireId}`,
    method: 'GET',
    headers: headers
  });
}

export function getQuestionnaireFromUrl(canonicalReferenceUrl: string): Promise<Questionnaire> {
  const formsServerUrl = 'https://sqlonfhir-r4.azurewebsites.net/fhir/';

  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json+fhir; charset=UTF-8',
    Accept: 'application/json+fhir; charset=utf-8'
  };

  return client(formsServerUrl).request({
    url: `Questionnaire?url=${canonicalReferenceUrl}`,
    method: 'GET',
    headers: headers
  });
}

export function getInitialQuestionnaireFromResponse(
  response: Questionnaire | Bundle
): Questionnaire | null {
  if (response.resourceType === 'Questionnaire') {
    return response;
  }

  const bundleEntries = response.entry;
  if (bundleEntries && bundleEntries.length > 0) {
    for (const entry of bundleEntries) {
      if (entry.resource?.resourceType === 'Questionnaire') {
        return entry.resource;
      }
    }
  }

  return null;
}

/**
 * FOR TESTING ONLY
 * Loads local questionnaires and returns them as an array of questionnaireResponses
 *
 * To add local questionnaires to list:
 * 1. Move questionnaire file to src/data/resources
 * 2. Import file at the beginning of this file
 *    i.e. import QNew from '../data/resources/NewQuestionnaire.json';
 *
 * 3. Add imported questionnaire in localFiles array below
 *    i.e. const localFiles = [
 *            Q715,
 *            QAssembled,
 *            QCvdCheck,
 *            QNew
 *         ] as Questionnaire[];
 *
 * @author Sean Fong
 */
export function loadQuestionnairesFromLocal() {
  const questionnaires = [
    Q715,
    Q715Modified,
    QAssembled,
    QCvdCheck,
    QCvdRisk,
    QCvdRiskHiso
  ] as Questionnaire[];

  return questionnaires;
}
