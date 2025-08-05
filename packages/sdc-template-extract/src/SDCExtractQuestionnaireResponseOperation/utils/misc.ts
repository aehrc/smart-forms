import type {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem
} from 'fhir/r4';

/**
 * Returns the Questionnaire.item matching the given linkId, searched recursively.
 *
 * @param questionnaire - The Questionnaire to search.
 * @param targetLinkId - The linkId of the item to find.
 * @returns The matching QuestionnaireItem, or null if not found.
 */
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

/**
 * Recursively searches a QuestionnaireItem and its children for the given linkId.
 *
 * @param qItem - The current QuestionnaireItem to search.
 * @param targetLinkId - The linkId to find.
 * @returns The matching QuestionnaireItem, or null if not found.
 */
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

/**
 * Returns the FHIRPath to a QuestionnaireResponse.item that matches the given linkId.
 *
 * @param questionnaireResponse - The QuestionnaireResponse to search through.
 * @param targetLinkId - The linkId of the item to find.
 * @returns A FHIRPath string using .item.where(linkId='...') syntax, or null if not found.
 */
export function getQuestionnaireResponseItemFhirPath(
  questionnaireResponse: QuestionnaireResponse,
  targetLinkId: string
): string | null {
  const topLevelQRItems = questionnaireResponse.item;
  if (!topLevelQRItems) {
    return null;
  }

  for (const item of topLevelQRItems) {
    const path = getQuestionnaireResponseItemFhirPathRecursive(
      item,
      targetLinkId,
      `item.where(linkId='${item.linkId}')`
    );
    if (path) {
      return path;
    }
  }

  return null;
}

/**
 * Recursively searches a QuestionnaireResponseItem tree and builds a FHIRPath to the item with the given linkId.
 *
 * @param qrItem - The current QuestionnaireResponseItem being traversed.
 * @param targetLinkId - The target linkId to match.
 * @param currentPath - The current FHIRPath traversal string using .where(linkId='...')
 * @returns A full FHIRPath string to the target item if found, or null if not found.
 */
function getQuestionnaireResponseItemFhirPathRecursive(
  qrItem: QuestionnaireResponseItem,
  targetLinkId: string,
  currentPath: string
): string | null {
  if (qrItem.linkId === targetLinkId) {
    return currentPath;
  }

  const childQRItems = qrItem.item;
  if (childQRItems) {
    for (const childQRItem of childQRItems) {
      const nextPath = `${currentPath}.item.where(linkId='${childQRItem.linkId}')`;
      const childPath = getQuestionnaireResponseItemFhirPathRecursive(
        childQRItem,
        targetLinkId,
        nextPath
      );
      if (childPath) {
        return childPath;
      }
    }
  }

  return null;
}
