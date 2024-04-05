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

// TODO to be imported into sdc-fhir-helpers

import type { Questionnaire, QuestionnaireItem } from 'fhir/r4';

export function getQuestionnaireItem(
  questionnaire: Questionnaire,
  targetLinkId: string
): QuestionnaireItem | null {
  // Search through the top level items recursively
  const topLevelQItems = questionnaire.item;
  if (topLevelQItems) {
    for (const topLevelQItem of topLevelQItems) {
      const foundQItem = getQuestionnaireItemRecursive(topLevelQItem, targetLinkId);
      if (foundQItem) {
        return foundQItem;
      }
    }
  }

  // No matching item found in the questionnaire, return null
  return null;
}

export function getQuestionnaireItemRecursive(
  qItem: QuestionnaireItem,
  targetLinkId: string
): QuestionnaireItem | null {
  // Target linkId found in current item
  if (qItem.linkId === targetLinkId) {
    return qItem;
  }

  // Search through its child items recursively
  const childQItems = qItem.item;
  if (childQItems) {
    for (const childQItem of childQItems) {
      const foundQItem = getQuestionnaireItemRecursive(childQItem, targetLinkId);
      if (foundQItem) {
        return foundQItem;
      }
    }
  }

  // No matching item found in the current item or its child items, return null
  return null;
}

///

export function getParentItem(
  questionnaire: Questionnaire,
  targetLinkId: string
): QuestionnaireItem | null {
  // Search through the top level items recursively
  const topLevelQItems = questionnaire.item;
  if (topLevelQItems) {
    for (const topLevelQItem of topLevelQItems) {
      const foundParentQItem = getParentItemRecursive(topLevelQItem, targetLinkId);
      if (foundParentQItem) {
        return foundParentQItem;
      }
    }
  }

  // No matching parent item found in the questionnaire, return null
  return null;
}

function getParentItemRecursive(
  qItem: QuestionnaireItem,
  targetLinkId: string,
  parentQItem?: QuestionnaireItem
): QuestionnaireItem | null {
  // Current item has the target linkId, return the parent item if it exists
  if (qItem.linkId === targetLinkId) {
    return parentQItem ?? null;
  }

  // Search through its child items recursively
  const childQItems = qItem.item;
  if (childQItems) {
    for (const childQItem of childQItems) {
      const foundParentQItem = getParentItemRecursive(childQItem, targetLinkId, qItem);
      if (foundParentQItem) {
        return foundParentQItem;
      }
    }
  }

  // No matching parent item found in the current item or its child items, return null
  return null;
}

export function getRepeatGroupParentItem(
  questionnaire: Questionnaire,
  targetLinkId: string
): QuestionnaireItem | null {
  // Search through the top level items recursively
  const topLevelQItems = questionnaire.item;
  if (topLevelQItems) {
    for (const topLevelQItem of topLevelQItems) {
      const foundParentQItem = getRepeatGroupParentItemRecursive(topLevelQItem, targetLinkId);
      if (foundParentQItem) {
        return foundParentQItem;
      }
    }
  }

  // No matching repeat group parent item found in the questionnaire, return null
  return null;
}

function getRepeatGroupParentItemRecursive(
  qItem: QuestionnaireItem,
  targetLinkId: string,
  repeatGroupParentQItem?: QuestionnaireItem
): QuestionnaireItem | null {
  // Current item has the target linkId, return the parent item if it exists
  if (qItem.linkId === targetLinkId && repeatGroupParentQItem) {
    return repeatGroupParentQItem ?? null;
  }

  // Check if the current item is a repeat group
  const isRepeatGroup = qItem.repeats && qItem.type === 'group';

  // Search through its child items recursively
  const childQItems = qItem.item;
  if (childQItems) {
    for (const childQItem of childQItems) {
      const foundParentQItem = getRepeatGroupParentItemRecursive(
        childQItem,
        targetLinkId,
        isRepeatGroup ? qItem : repeatGroupParentQItem
      );
      if (foundParentQItem) {
        return foundParentQItem;
      }
    }
  }

  // No matching repeat group parent item found in the current item or its child items, return null
  return null;
}
