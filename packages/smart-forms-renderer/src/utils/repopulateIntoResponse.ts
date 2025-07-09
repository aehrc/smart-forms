import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import type { ItemToRepopulate } from './repopulateItems';
import { getQrItemsIndex, mapQItemsIndex } from './mapItem';
import { questionnaireResponseStore, questionnaireStore } from '../stores';
import { updateQuestionnaireResponse } from './genericRecursive';

/**
 * Re-populate checked items in the re-population dialog into the current QuestionnaireResponse
 *
 * @author Sean Fong
 */
export function repopulateResponse(filteredItemsToRepopulate: Record<string, ItemToRepopulate>) {
  const sourceQuestionnaire = questionnaireStore.getState().sourceQuestionnaire;
  const updatableResponse = questionnaireResponseStore.getState().updatableResponse;

  return updateQuestionnaireResponse(
    sourceQuestionnaire,
    updatableResponse,
    repopulateItemRecursive,
    filteredItemsToRepopulate
  );
}

function repopulateItemRecursive(
  qItem: QuestionnaireItem,
  qrItemOrItems: QuestionnaireResponseItem | QuestionnaireResponseItem[] | null,
  filteredItemsToRepopulate: Record<string, ItemToRepopulate>
): QuestionnaireResponseItem | QuestionnaireResponseItem[] | null {
  // For repeat groups
  const hasMultipleAnswers = Array.isArray(qrItemOrItems);
  if (hasMultipleAnswers) {
    return constructRepeatGroup(qItem, qrItemOrItems, filteredItemsToRepopulate);
  }

  const childQItems = qItem.item;
  if (childQItems && childQItems.length > 0) {
    const childQrItems = qrItemOrItems?.item ?? [];

    const indexMap = mapQItemsIndex(qItem);
    const qrItemsByIndex = getQrItemsIndex(childQItems, childQrItems, indexMap);

    // For normal groups with children
    const updatedQRItems: QuestionnaireResponseItem[] = [];
    for (const [index, childQItem] of childQItems.entries()) {
      const childQRItemOrItems = qrItemsByIndex[index];

      const updatedChildQRItemOrItems = repopulateItemRecursive(
        childQItem,
        childQRItemOrItems ?? null,
        filteredItemsToRepopulate
      );

      if (Array.isArray(updatedChildQRItemOrItems)) {
        if (updatedChildQRItemOrItems.length > 0) {
          updatedQRItems.push(...updatedChildQRItemOrItems);
        }
        continue;
      }

      if (updatedChildQRItemOrItems) {
        updatedQRItems.push(updatedChildQRItemOrItems);
      }
    }

    return constructGroupItem(qItem, qrItemOrItems, updatedQRItems, filteredItemsToRepopulate);
  }

  return constructSingleItem(qItem, qrItemOrItems, filteredItemsToRepopulate);
}

function constructGroupItem(
  qItem: QuestionnaireItem,
  qrItemOrItems: QuestionnaireResponseItem | QuestionnaireResponseItem[] | null,
  childQrItems: QuestionnaireResponseItem[],
  filteredItemsToRepopulate: Record<string, ItemToRepopulate>
): QuestionnaireResponseItem | null {
  // Handle group items
  if (qItem.type === 'group') {
    return childQrItems && childQrItems.length > 0
      ? {
          linkId: qItem.linkId,
          text: qItem.text,
          item: childQrItems
        }
      : null;
  }

  // qrItemOrItems not supposed to be an array at this point
  if (Array.isArray(qrItemOrItems)) {
    return null;
  }

  // If item is not of type group, its a single item with children
  const itemToRepopulate = filteredItemsToRepopulate[qItem.linkId];
  if (!itemToRepopulate) {
    if (qrItemOrItems) {
      return {
        linkId: qItem.linkId,
        text: qItem.text,
        answer: qrItemOrItems.answer
      };
    }
    return null;
  }

  if (!itemToRepopulate.serverQRItem) {
    return null;
  }

  return {
    linkId: qItem.linkId,
    text: qItem.text,
    answer: itemToRepopulate.serverQRItem.answer
  };
}

function constructSingleItem(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem | null,
  filteredItemsToRepopulate: Record<string, ItemToRepopulate>
): QuestionnaireResponseItem | null {
  const itemToRepopulate = filteredItemsToRepopulate[qItem.linkId];

  if (!itemToRepopulate) {
    return qrItem ?? null;
  }

  if (qrItem && itemToRepopulate.serverQRItem) {
    return {
      ...qrItem,
      answer: itemToRepopulate.serverQRItem.answer
    };
  }

  if (!itemToRepopulate.serverQRItem) {
    return null;
  }

  return {
    linkId: qItem.linkId,
    text: qItem.text,
    answer: itemToRepopulate.serverQRItem.answer
  };
}

function constructRepeatGroup(
  qItem: QuestionnaireItem,
  qrItems: QuestionnaireResponseItem[],
  filteredItemsToRepopulate: Record<string, ItemToRepopulate>
): QuestionnaireResponseItem[] {
  const itemToRepopulate = filteredItemsToRepopulate[qItem.linkId];

  if (!itemToRepopulate || !itemToRepopulate.serverQRItems) {
    return qrItems;
  }

  return itemToRepopulate.serverQRItems;
}
