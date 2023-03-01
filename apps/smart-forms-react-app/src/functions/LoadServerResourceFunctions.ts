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
  Extension,
  FhirResource,
  OperationOutcome,
  Questionnaire
} from 'fhir/r5';
import Client from 'fhirclient/lib/Client';
import Q715 from '../data/resources/715.R4.json';
import QCvdCheck from '../data/resources/CVD Check.json';
import QCvdRisk from '../data/resources/CVD Risk.json';
import QCvdRiskHiso from '../data/resources/CVD Risk-HISO.json';
import QAboriginalTorresStraitIslanderHealthCheckAssembled from '../data/resources/Questionnaire-AboriginalTorresStraitIslanderHealthCheckAssembled-0.1.0.json';
import * as FHIR from 'fhirclient';
import { getFormsServerAssembledBundlePromise } from './DashboardFunctions';

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

export async function getAssembledQuestionnaire(
  questionnaire: Questionnaire | null
): Promise<Questionnaire | null> {
  if (!questionnaire) return null;

  // get assembled version of questionnaire if assembledFrom extension exists
  const assembledFrom = getAssembledFromExtension(questionnaire);
  if (assembledFrom && assembledFrom.valueCanonical) {
    // invalidate current referenced questionnaire because it requires assembly
    questionnaire = null;

    const queryUrl = '/Questionnaire?_sort=-date&url=' + assembledFrom.valueCanonical;
    const questionnaireBundle = await getFormsServerAssembledBundlePromise(queryUrl);
    if (questionnaireBundle.entry && questionnaireBundle.entry.length > 0) {
      const firstQuestionnaire = questionnaireBundle.entry[0].resource;

      // assign most recently updated questionnaire
      if (firstQuestionnaire) {
        questionnaire = firstQuestionnaire as Questionnaire;
      }
    }
  }
  return questionnaire;
}

export function getQuestionnaireFromUrl(canonicalUrl: string): Promise<Bundle> {
  const endpointUrl =
    process.env.REACT_APP_FORMS_SERVER_URL ??
    'http://csiro-csiro-14iep6fgtigke-1594922365.ap-southeast-2.elb.amazonaws.com/fhir';

  let queryUrl = `Questionnaire?_sort=-date&url=${canonicalUrl}&`;
  queryUrl = queryUrl.replace('|', '&version=');

  return FHIR.client(endpointUrl).request({
    url: queryUrl,
    method: 'GET',
    headers: headers
  });
}

export function getAssembledFromExtension(questionnaire: Questionnaire | null): Extension | null {
  if (!questionnaire) return null;

  return (
    questionnaire.extension?.find(
      (e) =>
        e.url === 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-assembledFrom'
    ) ?? null
  );
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
