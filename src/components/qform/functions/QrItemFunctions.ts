import { QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r5';

export function createQuestionnaireResponse(
  questionnaireFormItem: QuestionnaireItem
): QuestionnaireResponse {
  return {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
    item: [
      {
        linkId: questionnaireFormItem.linkId,
        text: questionnaireFormItem.text,
        item: []
      }
    ]
  };
}

export function cleanQrItem(
  qrItem: QuestionnaireResponseItem
): QuestionnaireResponseItem | undefined {
  const items = qrItem.item;
  if (items && items.length > 0) {
    const cleanedItems: QuestionnaireResponseItem[] = [];

    // only get items with answers
    items.forEach((item) => {
      const cleanedQrItem = cleanQrItem(item);
      if (cleanedQrItem) {
        cleanedItems.push(cleanedQrItem);
      }
    });

    return cleanedItems.length > 0 ? { ...qrItem, item: cleanedItems } : undefined;
  }

  // check answer when qrItem is a single question
  return qrItem['answer'] ? qrItem : undefined;
}

export function createQrGroup(qItem: QuestionnaireItem): QuestionnaireResponseItem {
  return {
    linkId: qItem.linkId,
    text: qItem.text,
    item: []
  };
}

export function createQrItem(qItem: QuestionnaireItem): QuestionnaireResponseItem {
  return {
    linkId: qItem.linkId,
    text: qItem.text
  };
}

/**
 * Updates the QuestionnaireResponseItem group by slotting in a new/modified child QuestionnaireResponseItem
 *
 * @author Sean Fong
 */
export function updateLinkedItem(
  newQrItem: QuestionnaireResponseItem,
  qrGroup: QuestionnaireResponseItem,
  qItemsIndexMap: Record<string, number>
): void {
  if (qrGroup['item']) {
    const qrItemsRealIndexArr = qrGroup.item.map((qrItem) => qItemsIndexMap[qrItem.linkId]);

    if (newQrItem.linkId in qItemsIndexMap) {
      if (qrGroup.item.length === 0) {
        qrGroup.item.push(newQrItem);
      } else {
        const newQrItemIndex = qItemsIndexMap[newQrItem.linkId];
        for (let i = 0; i < qrItemsRealIndexArr.length; i++) {
          if (newQrItemIndex > qrItemsRealIndexArr[i]) {
            if (i === qrItemsRealIndexArr.length - 1) {
              qrGroup.item.push(newQrItem);
            }
            continue;
          }

          if (newQrItemIndex === qrItemsRealIndexArr[i]) {
            if (newQrItem.item?.length || newQrItem.answer?.length) {
              // newQrItem has answer value
              qrGroup.item[i] = newQrItem;
            } else {
              // newQrItem has no answer value
              qrGroup.item.splice(i, 1);
            }
            break;
          }
          if (newQrItemIndex < qrItemsRealIndexArr[i]) {
            qrGroup.item.splice(i, 0, newQrItem);
            break;
          }
        }
      }
    }
  }
}
