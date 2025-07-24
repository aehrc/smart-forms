import type {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem
} from 'fhir/r4';
import type { ComputedQRItemUpdates } from '../interfaces/computedUpdates.interface';
import { updateQuestionnaireResponse } from './genericRecursive';
import { getQrItemsIndex, mapQItemsIndex } from './mapItem';
import { createEmptyQrGroup, createEmptyQrItem, updateQrItemsInGroup } from './qrItem';

export function applyComputedUpdates(
  questionnaire: Questionnaire,
  updatedResponse: QuestionnaireResponse,
  computedUpdates: ComputedQRItemUpdates
): QuestionnaireResponse {
  if (Object.keys(computedUpdates).length === 0) {
    return updatedResponse;
  }

  return updateQuestionnaireResponse(
    questionnaire,
    updatedResponse,
    applyComputedUpdateRecursive,
    computedUpdates
  );
}

// Recursive function to apply updates for each item (and its children if applicable)
function applyComputedUpdateRecursive(
  qItem: QuestionnaireItem,
  qrItemOrItems: QuestionnaireResponseItem | QuestionnaireResponseItem[] | null,
  computedUpdates: ComputedQRItemUpdates
): QuestionnaireResponseItem | QuestionnaireResponseItem[] | null {
  // For repeat groups
  const hasMultipleAnswers = Array.isArray(qrItemOrItems);
  if (hasMultipleAnswers) {
    // Process repeating groups: Apply updates to each item in the group
    return applyComputedUpdateFromRepeatGroup(qItem, qrItemOrItems, computedUpdates);
  }

  // At this point qrItemOrItems is a single QuestionnaireResponseItem
  const qrItem = qrItemOrItems;

  // Process items with child items
  const childQItems = qItem.item ?? [];
  const childQrItems = qrItem?.item ?? [];
  if (childQItems.length > 0) {
    const indexMap = mapQItemsIndex(qItem);
    const qrItemsByIndex = getQrItemsIndex(childQItems, childQrItems, indexMap);

    // Iterate child items
    for (const [index, childQItem] of childQItems.entries()) {
      const childQRItemOrItems = qrItemsByIndex[index];

      const updatedChildQRItemOrItems = applyComputedUpdateRecursive(
        childQItem,
        childQRItemOrItems ?? null,
        computedUpdates
      );

      // Update QR items in repeating group
      if (Array.isArray(updatedChildQRItemOrItems)) {
        if (updatedChildQRItemOrItems.length > 0) {
          updateQrItemsInGroup(
            null,
            {
              linkId: childQItem.linkId,
              qrItems: updatedChildQRItemOrItems
            },
            qrItem ?? structuredClone(createEmptyQrGroup(qItem)),
            indexMap
          );
        }
        continue;
      }

      // Update QR items in non-repeating group
      const updatedChildQRItem = updatedChildQRItemOrItems;
      if (updatedChildQRItem) {
        updateQrItemsInGroup(
          updatedChildQRItem,
          null,
          qrItem ?? structuredClone(createEmptyQrGroup(qItem)),
          indexMap
        );
        continue;
      }

      // Update QR items where updatedChildQRItem is null
      if (updatedChildQRItem === null) {
        updateQrItemsInGroup(
          createEmptyQrItem(childQItem, undefined),
          null,
          qrItem ?? structuredClone(createEmptyQrGroup(qItem)),
          indexMap
        );
      }
    }

    return constructGroupItem(qItem, qrItem, computedUpdates);
  }

  // If it's a single item with no children, apply the computed update
  return constructSingleItem(qItem, qrItem, computedUpdates);
}

function applyComputedUpdateFromRepeatGroup(
  qItem: QuestionnaireItem,
  qrItems: QuestionnaireResponseItem[],
  computedUpdates: ComputedQRItemUpdates
) {
  if (!qItem.item) {
    return [];
  }

  return qrItems
    .flatMap((childQrItem) => applyComputedUpdateRecursive(qItem, childQrItem, computedUpdates))
    .filter((childQRItem): childQRItem is QuestionnaireResponseItem => !!childQRItem);
}

function constructGroupItem(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem | null,
  computedUpdates: ComputedQRItemUpdates
): QuestionnaireResponseItem | null {
  const computedUpdate = computedUpdates[qItem.linkId];

  // If group item has an existing answer, do not overwrite it with computed update
  if (qrItem?.answer && qrItem?.answer.length > 0) {
    return qrItem ?? null;
  }

  // No computed update, return the existing item
  if (computedUpdate === undefined) {
    return qrItem ?? null;
  }

  // If computed update is null, remove the item
  if (computedUpdate === null) {
    return null;
  }

  // If computed update is present, update the item
  if (qrItem) {
    return {
      ...qrItem,
      answer: computedUpdate.answer
    };
  }

  return {
    linkId: qItem.linkId,
    text: qItem.text,
    answer: computedUpdate.answer
  };
}

function constructSingleItem(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem | null,
  computedUpdates: ComputedQRItemUpdates
): QuestionnaireResponseItem | null {
  const computedUpdate = computedUpdates[qItem.linkId];
  // No computed update, return the existing item
  if (computedUpdate === undefined) {
    return qrItem ?? null;
  }

  // If computed update is null, remove the item
  if (computedUpdate === null) {
    return null;
  }

  // If computed update is present, update the item
  return {
    linkId: qItem.linkId,
    text: qItem.text,
    answer: computedUpdate.answer
  };
}
