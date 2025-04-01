import type {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem
} from 'fhir/r4';
import type { ComputedQRItemUpdates } from '../interfaces/computedUpdates.interface';
import { updateQuestionnaireResponse } from './genericRecursive';
import { getQrItemsIndex, mapQItemsIndex } from './mapItem';
import { updateQrItemsInGroup } from './qrItem';

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
  const update = computedUpdates[qItem.linkId];

  if (update === null) {
    // If update is null, remove the item (or group of items)
    return null;
  }

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

      // For non-repeating child items, apply the update
      if (!Array.isArray(updatedChildQRItemOrItems)) {
        const updatedChildQRItem = updatedChildQRItemOrItems;
        if (updatedChildQRItem) {
          updateQrItemsInGroup(
            updatedChildQRItem,
            null,
            qrItem ?? { linkId: qItem.linkId, text: qItem.text, item: [] },
            indexMap
          );
        }
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

  if (!computedUpdate) {
    return qrItem ?? null;
  }

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
  if (!computedUpdate) {
    return qrItem ?? null;
  }

  return {
    linkId: qItem.linkId,
    text: qItem.text,
    answer: computedUpdate.answer
  };
}
