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

import type { Bundle, OperationOutcome, Questionnaire } from 'fhir/r4';
import axios from 'axios';
import { createOperationOutcome } from './index';

import SQ715AboutTheHealthCheck from './resources/subquestionnaires/Questionnaire-715AboutTheHealthCheck.json';

const HEADERS = {
  'Cache-Control': 'no-cache',
  'Content-Type': 'application/json+fhir; charset=UTF-8',
  Accept: 'application/json+fhir; charset=utf-8'
};

export function getCanonicalUrls(
  parentQuestionnaire: Questionnaire,
  allCanonicals: string[]
): string[] | OperationOutcome {
  if (
    !parentQuestionnaire.item ||
    !parentQuestionnaire.item[0] ||
    !parentQuestionnaire.item[0].item
  )
    return createOperationOutcome('Master questionnaire does not have a valid item.');

  const subquestionnaireCanonicals = [];

  for (const item of parentQuestionnaire.item[0].item) {
    const extensions = item.extension;
    if (!extensions) continue;

    // Check if item has a subquestionnaire extension
    let isSubquestionnaire = false;
    let subquestionnaireCanonicalUrl = '';
    for (const extension of extensions) {
      extension.url;
      if (
        extension.url ===
          'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire' &&
        extension.valueCanonical
      ) {
        isSubquestionnaire = true;
        subquestionnaireCanonicalUrl = extension.valueCanonical;
        break;
      }
    }

    // Proceed to next item if subquestionnaire extension is not present
    if (!isSubquestionnaire) continue;

    // Check for duplicate canonicals to prevent a circular dependency situation
    if (allCanonicals.includes(subquestionnaireCanonicalUrl)) {
      return createOperationOutcome(
        parentQuestionnaire.id +
          ' contains a circular dependency on the questionnaire ' +
          subquestionnaireCanonicalUrl
      );
    }

    subquestionnaireCanonicals.push(subquestionnaireCanonicalUrl);
  }

  // Remove all subquestionnaire-items from master questionnaire
  // parentQuestionnaire.item[0].item = [];
  return subquestionnaireCanonicals;
}

export async function fetchSubquestionnaires(
  canonicalUrls: string[],
  formsServerEndpoint: string
): Promise<Questionnaire[] | OperationOutcome> {
  // Gather all promises to be executed at once
  const promises: Promise<any>[] = [];

  for (const canonicalUrl of canonicalUrls) {
    promises.push(fetchQuestionnaireByCanonical(canonicalUrl, formsServerEndpoint));
  }

  const resources: (OperationOutcome | Bundle)[] = [];
  try {
    const responses = await axios.all(promises);
    for (const response of responses) {
      const { data }: { data: Bundle | OperationOutcome } = response;
      resources.push(data);
    }
  } catch (err) {
    if (err instanceof Error) {
      return createOperationOutcome(err.message);
    }
  }

  const subquestionnaires = [];
  for (const [i, resource] of resources.entries()) {
    if (resource.resourceType === 'Bundle') {
      if (!resource.entry || !resource.entry[0]) {
        return createOperationOutcome('Unable to fetch questionnaire ' + canonicalUrls[i] + '.');
      }

      const subquestionnaire = resource.entry[0].resource;
      if (!subquestionnaire || subquestionnaire.resourceType !== 'Questionnaire') {
        return createOperationOutcome('Unable to fetch questionnaire ' + canonicalUrls[i] + '.');
      }
      subquestionnaires.push(subquestionnaire);
    } else {
      return resource.resourceType === 'OperationOutcome'
        ? resource
        : createOperationOutcome(
            'Bundle received while fetching questionnaire ' + canonicalUrls[i] + ' is invalid.'
          );
    }
  }

  return subquestionnaires;
}

async function fetchQuestionnaireByCanonical(
  canonicalUrl: string,
  formsServerEndpoint: string
): Promise<any> {
  canonicalUrl = canonicalUrl.replace('|', '&version=');

  return axios.get(`${formsServerEndpoint}/Questionnaire?url=${canonicalUrl}`, {
    method: 'GET',
    headers: HEADERS
  });
}

/**
 * FOR TESTING ONLY
 * Loads local subquestionnaires and returns them as an array of questionnaireResponses
 *
 * To add local questionnaires to list:
 * 1. Move questionnaire file to src/data/resources
 * 2. Import file at the beginning of this file
 *    i.e. import SQNew from './resources/subquestionnaires/QuestionnaireNew.json';
 *
 * 3. Add imported questionnaire in localFiles array below
 *    i.e. const subquestionnaires = [
 *            SQ715AboutTheHealthCheck,
 *            SQ715Consent,
 *            SQ715PatientDetails,
 *            SQ715AssessmentCurrentPriorities,
 *            SQNew
 *         ] as Questionnaire[];
 *
 * 4. Change of value of subquestionnairesSourceIsLocal to true on line 94.
 *    If it is already set to true, skip this step.
 *
 * 5. In your terminal, cd to <project dir>/packages/sdc-assemble.
 *    Run "npm run build" to compile the project.
 *
 * 6. Your changes will now be reflected in the renderer app.
 *
 * @author Sean Fong
 */
export function loadSubquestionnairesFromLocal() {
  const subquestionnaires = [SQ715AboutTheHealthCheck] as Questionnaire[];

  return subquestionnaires;
}
