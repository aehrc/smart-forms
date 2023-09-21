import type {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem
} from 'fhir/r4';
import type { ItemToRepopulate } from './repopulateItems';
import { getQrItemsIndex, mapQItemsIndex } from './mapItem';
import { updateQrItemsInGroup } from './qrItem';

export function repopulateItemsIntoResponse(
  questionnaire: Questionnaire,
  updatableResponse: QuestionnaireResponse,
  checkedItemsToRepopulate: Record<string, ItemToRepopulate>
): QuestionnaireResponse {
  if (
    !questionnaire.item ||
    questionnaire.item.length === 0 ||
    !updatableResponse.item ||
    updatableResponse.item.length === 0
  ) {
    return updatableResponse;
  }

  const topLevelQrItems: QuestionnaireResponseItem[] = [];
  for (const [index, topLevelQItem] of questionnaire.item.entries()) {
    const repopulatedTopLevelQrItem = updatableResponse.item[index] ?? {
      linkId: topLevelQItem.linkId,
      text: topLevelQItem.text,
      item: []
    };

    const updatedTopLevelQRItem = repopulateItemRecursive(
      topLevelQItem,
      repopulatedTopLevelQrItem,
      checkedItemsToRepopulate
    );

    if (Array.isArray(updatedTopLevelQRItem)) {
      if (updatedTopLevelQRItem.length > 0) {
        topLevelQrItems.push(...updatedTopLevelQRItem);
      }
      continue;
    }

    if (updatedTopLevelQRItem) {
      topLevelQrItems.push(updatedTopLevelQRItem);
    }
  }

  return { ...updatableResponse, item: topLevelQrItems };
}

function repopulateItemRecursive(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem | undefined,
  checkedItemsToRepopulate: Record<string, ItemToRepopulate>
): QuestionnaireResponseItem[] | QuestionnaireResponseItem | null {
  const childQItems = qItem.item;
  if (childQItems && childQItems.length > 0) {
    // iterate through items of item recursively
    const childQrItems = qrItem?.item ?? [];
    // const updatedChildQrItems: QuestionnaireResponseItem[] = [];

    // FIXME Not implemented for repeat groups
    if (qItem.type === 'group' && qItem.repeats) {
      return qrItem ?? null;
    }

    const indexMap = mapQItemsIndex(qItem);
    const qrItemsByIndex = getQrItemsIndex(childQItems, childQrItems, indexMap);

    // Otherwise loop through qItem as usual
    for (const [index, childQItem] of childQItems.entries()) {
      const childQrItem = qrItemsByIndex[index];

      // FIXME Not implemented for repeat groups
      if (Array.isArray(childQrItem)) {
        continue;
      }

      const newQrItem = repopulateItemRecursive(childQItem, childQrItem, checkedItemsToRepopulate);

      // FIXME Not implemented for repeat groups
      if (Array.isArray(newQrItem)) {
        continue;
      }

      if (newQrItem) {
        updateQrItemsInGroup(
          newQrItem,
          null,
          qrItem ?? { linkId: qItem.linkId, text: qItem.text, item: [] },
          indexMap
        );
      }
    }

    return constructGroupItem(qItem, qrItem, checkedItemsToRepopulate);
  }

  return constructSingleItem(qItem, qrItem, checkedItemsToRepopulate);
}

function constructGroupItem(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem | undefined,
  checkedItemsToRepopulate: Record<string, ItemToRepopulate>
): QuestionnaireResponseItem | null {
  const itemToRepopulate = checkedItemsToRepopulate[qItem.linkId];

  if (!itemToRepopulate) {
    return qrItem ?? null;
  }

  if (qrItem) {
    return {
      ...qrItem,
      answer: itemToRepopulate.newQRItem.answer
    };
  }

  return {
    linkId: qItem.linkId,
    text: qItem.text,
    answer: itemToRepopulate.newQRItem.answer
  };
}

function constructSingleItem(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem | undefined,
  checkedItemsToRepopulate: Record<string, ItemToRepopulate>
): QuestionnaireResponseItem | null {
  const itemToRepopulate = checkedItemsToRepopulate[qItem.linkId];

  if (!itemToRepopulate) {
    return qrItem ?? null;
  }

  if (qrItem) {
    return {
      ...qrItem,
      answer: itemToRepopulate.newQRItem.answer
    };
  }

  return {
    linkId: qItem.linkId,
    text: qItem.text,
    answer: itemToRepopulate.newQRItem.answer
  };
}
