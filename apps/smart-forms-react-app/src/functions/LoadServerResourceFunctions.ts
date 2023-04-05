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

import type { Bundle, BundleEntry, FhirResource, OperationOutcome, Questionnaire } from 'fhir/r5';
import type Client from 'fhirclient/lib/Client';
import QAboriginalTorresStraitIslanderHealthCheckAssembled from '../data/resources/Questionnaire-AboriginalTorresStraitIslanderHealthCheckAssembled-0.1.0.json';
import QTestAssembled715 from '../data/resources/TestAssembled715.json';
import QCvdRisk2023 from '../data/resources/CVD-Risk-2023.json';

import * as FHIR from 'fhirclient';
import { getFormsServerAssembledBundlePromise } from './DashboardFunctions';
import {
  assembleQuestionnaire,
  assemblyIsRequired,
  updateAssembledQuestionnaire
} from './AssembleFunctions';

export const headers = {
  'Cache-Control': 'no-cache',
  'Content-Type': 'application/json+fhir; charset=UTF-8',
  Accept: 'application/json+fhir; charset=utf-8'
};

export function fetchQuestionnaireById(
  client: Client,
  questionnaireId: string
): Promise<Questionnaire | OperationOutcome> {
  return client.request({
    url: 'Questionnaire/' + questionnaireId,
    method: 'GET',
    headers: headers
  });
}

export async function assembleIfRequired(
  questionnaire: Questionnaire
): Promise<Questionnaire | null> {
  // get assembled version of questionnaire if assembled-expectation extension exists
  const assembleRequired = assemblyIsRequired(questionnaire);
  if (assembleRequired) {
    // check for existing assembled questionnaires
    const queryUrl = `/Questionnaire?_sort=-date&url=${questionnaire.url}&version=${questionnaire.version}-assembled`;
    const bundle = await getFormsServerAssembledBundlePromise(queryUrl);

    // if there is an assembled questionnaire, return it
    if (bundle.entry && bundle.entry.length > 0) {
      const firstQuestionnaire = bundle.entry[0].resource;
      if (firstQuestionnaire) {
        return firstQuestionnaire as Questionnaire;
      }
    }

    // If not, perform assemble on-the-fly and save it to forms server
    const resource = await assembleQuestionnaire(questionnaire);
    if (resource.resourceType === 'OperationOutcome') return null;

    // at this point, assembly is successful
    // save assembled questionnaire to forms server and return it
    await updateAssembledQuestionnaire(questionnaire);
    return resource;
  }

  // questionnaire does not require assembly, return as usual
  return questionnaire;
}

export function getQuestionnaireFromUrl(canonicalUrl: string): Promise<Bundle> {
  const endpointUrl = process.env.REACT_APP_FORMS_SERVER_URL ?? 'https://api.smartforms.io/fhir';

  let queryUrl = `Questionnaire?_sort=-date&url=${canonicalUrl}&`;
  queryUrl = queryUrl.replace('|', '&version=');

  return FHIR.client(endpointUrl).request({
    url: queryUrl,
    method: 'GET',
    headers: headers
  });
}

export function getInitialQuestionnaireFromBundle(response: Bundle): Questionnaire | null {
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
    QCvdRisk2023,
    QTestAssembled715,
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
