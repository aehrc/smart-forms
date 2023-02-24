/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  Bundle,
  BundleEntry,
  FhirResource,
  Patient,
  Questionnaire,
  QuestionnaireResponse
} from 'fhir/r5';
import Client from 'fhirclient/lib/Client';
import Q715 from '../data/resources/715.R4.json';
import QCvdCheck from '../data/resources/CVD Check.json';
import QCvdRisk from '../data/resources/CVD Risk.json';
import QCvdRiskHiso from '../data/resources/CVD Risk-HISO.json';
import QAboriginalTorresStraitIslanderHealthCheckAssembled from '../data/resources/Questionnaire-AboriginalTorresStraitIslanderHealthCheckAssembled-0.1.0.json';

/**
 * Sends a request to forms server to obtain the first ten questionnaires that fufills the parameters provided
 *
 * @author Sean Fong
 */
export async function loadQuestionnairesFromServer(
  client: Client,
  input?: string
): Promise<Bundle> {
  const urlParams = input ? `title=${input}` : '';

  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json+fhir; charset=UTF-8',
    Accept: 'application/json+fhir; charset=utf-8'
  };

  return client.request({
    url: 'Questionnaire?_count=10&_sort=-&' + urlParams,
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
  client: Client,
  questionnaireReference: string
): Promise<Questionnaire> {
  const questionnaireId = questionnaireReference.replace('Questionnaire/', '');

  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json+fhir; charset=UTF-8',
    Accept: 'application/json+fhir; charset=utf-8'
  };

  // FIXME cater for canonical reference too

  return client.request({
    url: `Questionnaire/${questionnaireId}`,
    method: 'GET',
    headers: headers
  });
}

export function getQuestionnaireFromUrl(
  client: Client,
  canonicalReferenceUrl: string
): Promise<Questionnaire | Bundle> {
  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json+fhir; charset=UTF-8',
    Accept: 'application/json+fhir; charset=utf-8'
  };

  return client.request({
    url: `Questionnaire?url=${canonicalReferenceUrl}&_sort=-&`,
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
 * Loads local questionnaires and returns them as an array of questionnaires
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
    QCvdCheck,
    QCvdRisk,
    QCvdRiskHiso,
    QAboriginalTorresStraitIslanderHealthCheckAssembled
  ] as Questionnaire[];

  return questionnaires;
}

export function constructBundle(resources: FhirResource[]): Bundle {
  const bundleEntries: BundleEntry[] = resources.map((resource) => {
    return {
      resource: resource
    };
  });

  return {
    entry: bundleEntries,
    resourceType: 'Bundle',
    type: 'collection'
  };
}
