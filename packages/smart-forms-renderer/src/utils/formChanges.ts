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

import type { QuestionnaireResponseItemAnswer } from 'fhir/r4';

type JsonDiffOperator = '+' | '-' | '~' | ' ';

type QuestionnaireResponseItemDiffArray = [JsonDiffOperator, QuestionnaireResponseDiffItem];
type QuestionnaireResponseItemAnswerDiffArray = [JsonDiffOperator, QuestionnaireResponseItemAnswer];

interface QuestionnaireResponseDiffItem {
  linkId: string;
  item: QuestionnaireResponseItemDiffArray[] | undefined;
  answer:
    | QuestionnaireResponseItemAnswer[]
    | QuestionnaireResponseItemAnswerDiffArray[]
    | undefined;
}

interface ItemChange {
  linkId: string;
  itemType: string;
  operation: 'add' | 'remove' | 'update';
  value: QuestionnaireResponseItemAnswer;
}

export function readFormChanges(formChanges: object, itemTypes: Record<string, string>) {
  if (!('item' in formChanges)) {
    return {};
  }

  const changedItems: Record<string, ItemChange | null> = {};
  const diffArrays = formChanges.item as QuestionnaireResponseItemDiffArray[];
  for (const diffArray of diffArrays) {
    readItemChangesRecursive(diffArray, itemTypes, changedItems);
  }

  return changedItems;
}

export function readItemChangesRecursive(
  diffArray: QuestionnaireResponseItemDiffArray,
  itemTypes: Record<string, string>,
  changedItems: Record<string, ItemChange | null>
) {
  const operator = diffArray[0];
  const diffItem = diffArray[1];

  if (!operator || !diffItem) {
    return changedItems;
  }

  changedItems[diffItem.linkId] = null;

  const childDiffArrays = diffItem.item;
  if (childDiffArrays && childDiffArrays.length > 0) {
    for (const childDiffArray of childDiffArrays) {
      readItemChangesRecursive(childDiffArray, itemTypes, changedItems);
    }
  }

  // if (operator !== ' ') {
  //   console.log(operator, diffItem);
  // }

  // explore answer diff arrays
  // exmaple: [["+", {"valueString": "test"}], ["-", {"valueString": "test"}]]
  // or it could be a regular answer array
  // exmaple: [{"valueString": "test"}, {"valueString": "test"}]

  const answerDiffArrays = diffItem.answer;
  if (answerDiffArrays && isAnswerDiffArray(answerDiffArrays)) {
    for (const answerDiffArray of answerDiffArrays) {
      getItemChange(diffItem, answerDiffArray, itemTypes, changedItems);
    }
  }

  return changedItems;
}

function getItemChange(
  diffItem: QuestionnaireResponseDiffItem,
  answerDiffArray: QuestionnaireResponseItemAnswerDiffArray,
  itemTypes: Record<string, string>,
  changedItems: Record<string, ItemChange | null>
) {
  const operator = answerDiffArray[0];
  const answer = answerDiffArray[1];

  if (operator === ' ') {
    return;
  }

  const itemType = itemTypes[diffItem.linkId];
  const operation = answerDiffOperationSwitcher(operator);
  if (operation) {
    changedItems[diffItem.linkId] = {
      linkId: diffItem.linkId,
      itemType: itemType,
      operation: operation,
      value: answer
    };
  }
}

function answerDiffOperationSwitcher(operator: JsonDiffOperator): ItemChange['operation'] | null {
  switch (operator) {
    case '+':
      return 'add';
    case '-':
      return 'remove';
    case '~':
      return 'update';
    default:
      return null;
  }
}

// type predicates
function isAnswerDiffArray(answer: any[]): answer is QuestionnaireResponseItemAnswerDiffArray[] {
  return answer.every(
    (answerItem) =>
      Array.isArray(answerItem) &&
      typeof answerItem[0] === 'string' &&
      typeof answerItem[1] === 'object'
  );
}
