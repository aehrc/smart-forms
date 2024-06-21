/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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

import type { Bundle, BundleEntry, Questionnaire } from 'fhir/r4b';
import { HEADERS } from './globals';

export async function getQuestionnaire(
  questionnaireCanonical: string,
  formsServerUrl: string
): Promise<Questionnaire | null> {
  questionnaireCanonical = questionnaireCanonical.replace('|', '&version=');

  const requestUrl = `${formsServerUrl}/Questionnaire?url=${questionnaireCanonical}&_sort=_lastUpdated`;
  const response = await fetch(requestUrl, { headers: HEADERS });

  if (!response.ok) {
    return null;
  }

  const result = await response.json();
  if (resultIsQuestionnaireOrBundle(result)) {
    if (result.resourceType === 'Questionnaire') {
      return result;
    }

    if (result.resourceType === 'Bundle') {
      const firstQuestionnaire = result.entry
        ?.filter(
          (entry): entry is BundleEntry<Questionnaire> =>
            entry.resource?.resourceType === 'Questionnaire'
        )
        .map((entry) => entry.resource)
        .find((questionnaire) => !!questionnaire);

      if (firstQuestionnaire) {
        return firstQuestionnaire;
      }
    }
  }

  return null;
}

function resultIsQuestionnaireOrBundle(result: any): result is Questionnaire | Bundle {
  return (
    result.resourceType &&
    (result.resourceType === 'Questionnaire' || result.resourceType === 'Bundle')
  );
}
