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

import type { QuestionnaireItem } from 'fhir/r4';

/**
 * Resolve duplicate linkIds in a Questionnaire item's enableWhen recursively
 *
 * @param qItem - A group/non-group Questionnaire item
 * @param duplicateLinkIds - A key-value pair of duplicate linkIds and their respective resolved linkIds
 * @return A Questionnaire item with resolved duplicate linkIds in its enableWhen
 *
 * @author Sean Fong
 */
export function resolveDuplicateEnableWhen(
  qItem: QuestionnaireItem,
  duplicateLinkIds: Record<string, string>
): QuestionnaireItem {
  const items = qItem.item;
  if (items && items.length > 0) {
    // iterate through items of item recursively
    const resolvedItems: QuestionnaireItem[] = [];

    items.forEach((item) => {
      const resolvedItem = resolveDuplicateEnableWhen(item, duplicateLinkIds);
      if (resolvedItem) {
        resolvedItems.push(resolvedItem);
      } else {
        resolvedItems.push(item);
      }
    });
    qItem.item = resolvedItems;

    return resolveSingleItemEnableWhen(qItem, duplicateLinkIds);
  }

  return resolveSingleItemEnableWhen(qItem, duplicateLinkIds);
}

/**
 * Resolve duplicate linkIds in a single Questionnaire item's enableWhen
 *
 * @param qItem - A group/non-group Questionnaire item
 * @param duplicateLinkIds - A key-value pair of duplicate linkIds and their respective resolved linkIds
 * @return A single Questionnaire item with resolved duplicate linkIds in its enableWhen
 *
 * @author Sean Fong
 */
function resolveSingleItemEnableWhen(
  qItem: QuestionnaireItem,
  duplicateLinkIds: Record<string, string>
): QuestionnaireItem {
  if (qItem.enableWhen && qItem.enableWhen.length > 0) {
    qItem.enableWhen = qItem.enableWhen.map((entry) => {
      const duplicateLinkedItemId = duplicateLinkIds[entry.question];
      if (duplicateLinkedItemId) {
        entry.question = duplicateLinkedItemId;
      }
      return entry;
    });
  }
  return qItem;
}
