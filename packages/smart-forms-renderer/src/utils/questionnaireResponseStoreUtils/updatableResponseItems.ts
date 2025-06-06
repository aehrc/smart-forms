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

import type {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem
} from 'fhir/r4';

export function createQuestionnaireResponseItemMap(
  sourceQuestionnaire: Questionnaire,
  questionnaireResponse: QuestionnaireResponse
): Record<string, QuestionnaireResponseItem[]> {
  if (!sourceQuestionnaire.item || sourceQuestionnaire.item.length === 0) {
    return {};
  }

  // Even if the questionnaireResponse has no items, we still need to identify an empty entry for every linkId
  const questionnaireResponseItemMap: Record<string, QuestionnaireResponseItem[]> = {};
  for (const topLevelQItem of sourceQuestionnaire.item) {
    fillQuestionnaireResponseItemMapEmptyEntriesRecursive(
      topLevelQItem,
      questionnaireResponseItemMap
    );
  }

  // Now loop through the questionnaireResponse items and fill the map
  if (questionnaireResponse.item) {
    for (const topLevelQRItem of questionnaireResponse.item) {
      fillQuestionnaireResponseItemMapRecursive(topLevelQRItem, questionnaireResponseItemMap);
    }
  }

  return questionnaireResponseItemMap;
}

function fillQuestionnaireResponseItemMapRecursive(
  qrItem: QuestionnaireResponseItem,
  questionnaireResponseItemMap: Record<string, QuestionnaireResponseItem[]>
) {
  const qrItems = qrItem.item;
  if (qrItems && qrItems.length > 0) {
    // iterate through items of item recursively
    for (const childQRItem of qrItems) {
      fillQuestionnaireResponseItemMapRecursive(childQRItem, questionnaireResponseItemMap);
    }
  }

  fillQuestionnaireResponseItemMap(qrItem, questionnaireResponseItemMap);
}

function fillQuestionnaireResponseItemMap(
  qrItem: QuestionnaireResponseItem,
  questionnaireResponseItemMap: Record<string, QuestionnaireResponseItem[]>
) {
  // linkId already exists in questionnaireResponseItemMap, it would be a repeat group
  if (qrItem.linkId in questionnaireResponseItemMap) {
    questionnaireResponseItemMap[qrItem.linkId].push(qrItem);
  }
  // Add item to questionnaireResponseItemMap
  else {
    questionnaireResponseItemMap[qrItem.linkId] = [qrItem];
  }
}

function fillQuestionnaireResponseItemMapEmptyEntriesRecursive(
  qItem: QuestionnaireItem,
  questionnaireResponseItemMap: Record<string, QuestionnaireResponseItem[]>
) {
  const qItems = qItem.item;
  if (qItems && qItems.length > 0) {
    // iterate through items of item recursively
    for (const childQItem of qItems) {
      fillQuestionnaireResponseItemMapEmptyEntriesRecursive(
        childQItem,
        questionnaireResponseItemMap
      );
    }
  }

  questionnaireResponseItemMap[qItem.linkId] = [];
}
