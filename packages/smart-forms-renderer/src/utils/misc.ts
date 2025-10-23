/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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
import type { Tabs } from '../interfaces';
import { getShortText, isSpecificItemControl } from './extensions';
import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';

// Get QuestionnaireItem from Questionnaire based on linkId
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

function getQuestionnaireItemRecursive(
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

// Get QuestionnaireResponseItem from QuestionnaireResponse based on linkId
export function getQuestionnaireResponseItem(
  questionnaireResponse: QuestionnaireResponse,
  targetLinkId: string
): QuestionnaireResponseItem | null {
  // Search through the top level items recursively
  const topLevelQRItems = questionnaireResponse.item;
  if (topLevelQRItems) {
    for (const topLevelQRItem of topLevelQRItems) {
      const foundQRItem = getQuestionnaireResponseItemRecursive(topLevelQRItem, targetLinkId);
      if (foundQRItem) {
        return foundQRItem;
      }
    }
  }

  // No matching item found in the questionnaire, return null
  return null;
}

function getQuestionnaireResponseItemRecursive(
  qrItem: QuestionnaireResponseItem,
  targetLinkId: string
): QuestionnaireResponseItem | null {
  // Target linkId found in current item
  if (qrItem.linkId === targetLinkId) {
    return qrItem;
  }

  // Search through its child items recursively
  const childQRItems = qrItem.item;
  if (childQRItems) {
    for (const childQRItem of childQRItems) {
      const foundQRItem = getQuestionnaireResponseItemRecursive(childQRItem, targetLinkId);
      if (foundQRItem) {
        return foundQRItem;
      }
    }
  }

  // No matching item found in the current item or its child items, return null
  return null;
}

// Replace QuestionnaireResponseItem in QuestionnaireResponse based on linkId with a new QR item
export function replaceQuestionnaireResponseItem(
  questionnaireResponse: QuestionnaireResponse,
  targetLinkId: string,
  newQRItem: QuestionnaireResponseItem | null
): QuestionnaireResponse {
  if (!questionnaireResponse.item) return questionnaireResponse;

  const updatedItems = replaceQuestionnaireResponseItemRecursive(
    questionnaireResponse.item,
    targetLinkId,
    newQRItem
  );

  return {
    ...questionnaireResponse,
    item: updatedItems.length > 0 ? updatedItems : undefined // Remove top-level item array if empty
  };
}

function replaceQuestionnaireResponseItemRecursive(
  items: QuestionnaireResponseItem[],
  targetLinkId: string,
  newQRItem: QuestionnaireResponseItem | null
): QuestionnaireResponseItem[] {
  return items
    .map((item) => {
      if (item.linkId === targetLinkId) {
        return newQRItem; // Replace or remove
      }

      if (!item.item) return item; // No child items, return as is

      const updatedChildren = replaceQuestionnaireResponseItemRecursive(
        item.item,
        targetLinkId,
        newQRItem
      );

      if (updatedChildren.length === 0) {
        return null; // Remove parent if all its children are gone
      }

      return { ...item, item: updatedChildren };
    })
    .filter(Boolean) as QuestionnaireResponseItem[]; // Remove any `null` entries
}

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

/**
 * Returns the section heading text for a given linkId in a questionnaire, used to label tab sections.
 *
 * @param questionnaire - The FHIR Questionnaire to search through.
 * @param targetLinkId - The linkId of the target item.
 * @param tabs - Tab definitions used to match section headings.
 * @returns The section heading text if found, otherwise null.
 */
export function getSectionHeading(
  questionnaire: Questionnaire,
  targetLinkId: string,
  tabs: Tabs
): string | null {
  // Search through the top level items recursively
  const topLevelQItems = questionnaire.item;
  if (topLevelQItems) {
    for (const topLevelQItem of topLevelQItems) {
      const heading = topLevelQItem.text ?? null;

      const foundQItem = getSectionHeadingRecursive(topLevelQItem, targetLinkId, heading, tabs);
      if (foundQItem) {
        return foundQItem;
      }
    }
  }

  // No heading found in the questionnaire, return null
  return null;
}

export function getSectionHeadingRecursive(
  qItem: QuestionnaireItem,
  targetLinkId: string,
  heading: string | null,
  tabs: Tabs
): string | null {
  // Target linkId found in current item
  if (qItem.linkId === targetLinkId) {
    return heading;
  }

  // Search through its child items recursively
  const childQItems = qItem.item;
  if (childQItems) {
    const isTab = !!tabs[qItem.linkId];
    if (isTab) {
      heading = getShortText(qItem) ?? qItem.text ?? null;
    }
    for (const childQItem of childQItems) {
      const foundHeading = getSectionHeadingRecursive(childQItem, targetLinkId, heading, tabs);
      if (foundHeading) {
        return foundHeading;
      }
    }
  }

  // No heading found in the current item or its child items, return null
  return null;
}

// TODO test this unit test
/**
 * Checks whether the item with the given linkId is nested under a grid item in the questionnaire.
 * The item itself is not considered — only its ancestors are checked.
 *
 * @param questionnaire - The FHIR Questionnaire to search through
 * @param targetLinkId - The linkId of the item to check
 * @returns True if the item is nested under a grid item, false otherwise
 */
export function isItemInGrid(questionnaire: Questionnaire, targetLinkId: string): boolean {
  // Search through the top level items recursively
  const topLevelQItems = questionnaire.item;
  if (topLevelQItems) {
    for (const topLevelQItem of topLevelQItems) {
      const currentItemIsGrid = isSpecificItemControl(topLevelQItem, 'grid');

      const isInGrid = isItemInGridRecursive(topLevelQItem, targetLinkId, currentItemIsGrid);

      if (isInGrid) {
        return true;
      }
    }
  }

  return false;
}

function isItemInGridRecursive(
  qItem: QuestionnaireItem,
  targetLinkId: string,
  hasGridAncestor: boolean
): boolean {
  // Target linkId found in current item
  if (qItem.linkId === targetLinkId) {
    return hasGridAncestor;
  }

  // Search through its child items recursively
  const childItems = qItem.item;
  if (childItems) {
    const currentItemIsGrid = isSpecificItemControl(qItem, 'grid');
    const updatedHasGridAncestor = hasGridAncestor || currentItemIsGrid;

    for (const child of childItems) {
      const isInGrid = isItemInGridRecursive(child, targetLinkId, updatedHasGridAncestor);
      if (isInGrid) {
        return true;
      }
    }
  }

  // No matching item found in the current item or its child items
  return false;
}

/**
 * Retrieves a `QuestionnaireResponseItem` using a FHIRPath-compatible path string.
 *
 * @param questionnaireResponse - The `QuestionnaireResponse` resource to search.
 * @param fhirPathString - A FHIRPath string that locates the item, e.g., "item.where(linkId='g1').item.where(linkId='q1')[0]"
 * @returns The matching `QuestionnaireResponseItem` or `null` if not found.
 */
export function getQuestionnaireResponseItemViaFhirPath(
  questionnaireResponse: QuestionnaireResponse,
  fhirPathString: string
): QuestionnaireResponseItem | null {
  const result = fhirpath.evaluate(questionnaireResponse, fhirPathString, {}, fhirpath_r4_model, {
    async: false
  });
  return (result.length > 0 ? result[0] : null) as QuestionnaireResponseItem | null;
}
