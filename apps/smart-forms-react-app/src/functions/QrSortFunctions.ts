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

import { QuestionnaireResponse } from 'fhir/r5';

export function sortByQuestionnaireName(
  questionnaireResponses: QuestionnaireResponse[]
): QuestionnaireResponse[] {
  questionnaireResponses.sort((a, b) => {
    const qNameA = a.item?.[0].text;
    const qNameB = b.item?.[0].text;

    if (!qNameA || !qNameB) return 0;
    if (qNameA < qNameB) return -1;
    if (qNameA > qNameB) return 1;
    return 0;
  });
  return [...questionnaireResponses];
}

export function sortByAuthorName(
  questionnaireResponses: QuestionnaireResponse[]
): QuestionnaireResponse[] {
  questionnaireResponses.sort((a, b) => {
    const authorNameA = a.author?.display;
    const authorNameB = b.author?.display;

    if (!authorNameA || !authorNameB) return 0;
    if (authorNameA < authorNameB) return -1;
    if (authorNameA > authorNameB) return 1;
    return 0;
  });
  return [...questionnaireResponses];
}

export function sortByLastUpdated(
  questionnaireResponses: QuestionnaireResponse[]
): QuestionnaireResponse[] {
  questionnaireResponses.sort((a, b) => {
    const lastUpdatedA = a.meta?.lastUpdated;
    const lastUpdatedB = b.meta?.lastUpdated;

    if (!lastUpdatedA || !lastUpdatedB) return 0;
    if (lastUpdatedA < lastUpdatedB) return -1;
    if (lastUpdatedA > lastUpdatedB) return 1;
    return 0;
  });
  return [...questionnaireResponses];
}

export function sortByStatus(
  questionnaireResponses: QuestionnaireResponse[]
): QuestionnaireResponse[] {
  questionnaireResponses.sort((a, b) => {
    const lastUpdatedA = a.status;
    const lastUpdatedB = b.status;

    if (lastUpdatedA < lastUpdatedB) return -1;
    if (lastUpdatedA > lastUpdatedB) return 1;
    return 0;
  });
  return [...questionnaireResponses];
}
