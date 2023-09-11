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

import { QuestionnaireItem } from 'fhir/r4';
import { ItemToRepopulate } from './repopulate';

export function checkIsRepeatGroupToRepopulate(
  qItem: QuestionnaireItem,
  itemsToRepopulate: Record<string, ItemToRepopulate>
) {
  if (!qItem.item) {
    return false;
  }

  for (const childItem of qItem.item) {
    if (itemsToRepopulate[childItem.linkId]) {
      return true;
    }
  }
}

export function getRepeatGroupToRepopulate(
  qItem: QuestionnaireItem,
  itemsToRepopulate: Record<string, ItemToRepopulate>
) {
  if (!qItem.item) {
    return null;
  }

  const childLinkIds = qItem.item
    .filter((childItem) => !!itemsToRepopulate[childItem.linkId])
    .map((childItem) => childItem.linkId);

  const childQRItemsToRepopulate = childLinkIds
    .reduce((result: ItemToRepopulate[], linkId) => {
      if (itemsToRepopulate[linkId]) {
        result.push(itemsToRepopulate[linkId]);
      }
      return result;
    }, [])
    .map((itemToRepopulate) => itemToRepopulate.newQRItem);

  const repeatGroupToRepopulate: ItemToRepopulate = {
    heading: qItem.text ?? null,
    qItem: qItem,
    newQRItem: {
      linkId: qItem.linkId,
      text: qItem.text,
      item: childQRItemsToRepopulate
    }
  };

  return repeatGroupToRepopulate;
}
