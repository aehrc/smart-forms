import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import type { ItemToRepopulate } from './repopulateItems';
import { getQrItemsIndex, mapQItemsIndex } from './mapItem';
import { isSpecificItemControl } from './itemControl';
import { questionnaireResponseStore, questionnaireStore } from '../stores';
import { updateQuestionnaireResponse } from './updateQr';

/**
 * Re-populate checked items in the re-population dialog into the current QuestionnaireResponse
 *
 * @author Sean Fong
 */
export function repopulateResponse(checkedItemsToRepopulate: Record<string, ItemToRepopulate>) {
  const sourceQuestionnaire = questionnaireStore.getState().sourceQuestionnaire;
  const updatableResponse = questionnaireResponseStore.getState().updatableResponse;

  return updateQuestionnaireResponse(
    sourceQuestionnaire,
    updatableResponse,
    repopulateItemRecursive,
    checkedItemsToRepopulate
  );
}

function repopulateItemRecursive(
  qItem: QuestionnaireItem,
  qrItemOrItems: QuestionnaireResponseItem | QuestionnaireResponseItem[] | null,
  checkedItemsToRepopulate: Record<string, ItemToRepopulate>
): QuestionnaireResponseItem | QuestionnaireResponseItem[] | null {
  // For repeat groups
  const hasMultipleAnswers = Array.isArray(qrItemOrItems);
  if (hasMultipleAnswers) {
    return constructRepeatGroup(qItem, qrItemOrItems, checkedItemsToRepopulate);
  }

  const childQItems = qItem.item;
  if (childQItems && childQItems.length > 0) {
    const childQrItems = qrItemOrItems?.item ?? [];

    const indexMap = mapQItemsIndex(qItem);
    const qrItemsByIndex = getQrItemsIndex(childQItems, childQrItems, indexMap);

    // For grid groups
    const itemIsGrid = isSpecificItemControl(qItem, 'grid');
    if (itemIsGrid) {
      return constructGridGroup(qItem, qrItemOrItems, checkedItemsToRepopulate);
    }

    // For normal groups with children
    const updatedQRItems: QuestionnaireResponseItem[] = [];
    for (const [index, childQItem] of childQItems.entries()) {
      const childQRItemOrItems = qrItemsByIndex[index];

      const updatedChildQRItemOrItems = repopulateItemRecursive(
        childQItem,
        childQRItemOrItems ?? null,
        checkedItemsToRepopulate
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

    return constructGroupItem(qItem, qrItemOrItems, updatedQRItems, checkedItemsToRepopulate);
  }

  return constructSingleItem(qItem, qrItemOrItems, checkedItemsToRepopulate);
}

function constructGroupItem(
  qItem: QuestionnaireItem,
  qrItemOrItems: QuestionnaireResponseItem | QuestionnaireResponseItem[] | null,
  childQrItems: QuestionnaireResponseItem[],
  checkedItemsToRepopulate: Record<string, ItemToRepopulate>
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
  const itemToRepopulate = checkedItemsToRepopulate[qItem.linkId];
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

  if (!itemToRepopulate.newQRItem) {
    return null;
  }

  return {
    linkId: qItem.linkId,
    text: qItem.text,
    answer: itemToRepopulate.newQRItem.answer
  };
}

function constructSingleItem(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem | null,
  checkedItemsToRepopulate: Record<string, ItemToRepopulate>
): QuestionnaireResponseItem | null {
  const itemToRepopulate = checkedItemsToRepopulate[qItem.linkId];

  if (!itemToRepopulate) {
    return qrItem ?? null;
  }

  if (qrItem && itemToRepopulate.newQRItem) {
    return {
      ...qrItem,
      answer: itemToRepopulate.newQRItem.answer
    };
  }

  if (!itemToRepopulate.newQRItem) {
    return null;
  }

  return {
    linkId: qItem.linkId,
    text: qItem.text,
    answer: itemToRepopulate.newQRItem.answer
  };
}

function constructGridGroup(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem | null,
  checkedItemsToRepopulate: Record<string, ItemToRepopulate>
) {
  const itemToRepopulate = checkedItemsToRepopulate[qItem.linkId];

  if (!itemToRepopulate || !itemToRepopulate.newQRItem) {
    return qrItem;
  }

  const qrItemsToRepopulate = itemToRepopulate.newQRItem.item;

  if (!qrItemsToRepopulate) {
    return qrItem;
  }

  const oldQrItems = qrItem?.item;

  if (!oldQrItems) {
    return {
      linkId: qItem.linkId,
      text: qItem.text,
      item: qrItemsToRepopulate
    };
  }

  const qrItemsToRepopulateMap = qrItemsToRepopulate.reduce(
    (mapping: Record<string, QuestionnaireResponseItem>, item) => {
      mapping[item.linkId] = item;
      return mapping;
    },
    {}
  );

  const repopulatedQrItems = oldQrItems.map((oldQrItem) => {
    const qrItemToRepopulate = qrItemsToRepopulateMap[oldQrItem.linkId];

    if (!qrItemToRepopulate) {
      return oldQrItem;
    }

    return {
      ...oldQrItem,
      item: qrItemToRepopulate.item
    };
  });

  return { ...qrItem, item: repopulatedQrItems };
}

function constructRepeatGroup(
  qItem: QuestionnaireItem,
  qrItems: QuestionnaireResponseItem[],
  checkedItemsToRepopulate: Record<string, ItemToRepopulate>
): QuestionnaireResponseItem[] {
  const itemToRepopulate = checkedItemsToRepopulate[qItem.linkId];

  if (!itemToRepopulate || !itemToRepopulate.newQRItems) {
    return qrItems;
  }

  return itemToRepopulate.newQRItems;
}
