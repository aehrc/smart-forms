import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { isRepeatItemAndNotCheckbox } from './QItemFunctions';
import { QItemType } from '../interfaces/Enums';

/**
 * Generate an array of QuestionnaireResponseItems corresponding to its QuestionnaireItem indexes an array.
 * QuestionnaireItems without a corresponding QuestionnaireResponseItem is set as undefined.
 * i.e. QItems = [QItem0, QItem1, QItem2]. Only QItem0 and QItem2 have QrItems
 * Generated array: [QrItem0, undefined, QrItem2]
 *
 * @author Sean Fong
 */
export function getQrItemsIndex(
  qItems: QuestionnaireItem[],
  qrItems: QuestionnaireResponseItem[],
  qItemsIndexMap: Record<string, number>
): (QuestionnaireResponseItem | QuestionnaireResponseItem[])[] {
  // Generate a <linkId, QrItem OR QrItems> dictionary
  const qrItemsCollected: Record<string, QuestionnaireResponseItem | QuestionnaireResponseItem[]> =
    {};
  for (const qrItem of qrItems) {
    const linkId = qrItem.linkId;

    // If item already exists, it has multiple qrItems and is therefore a repeat group
    if (qrItemsCollected[linkId]) {
      let storedValue = qrItemsCollected[linkId];

      // Create an array out of initial stored value if it is not an array initially
      if (!Array.isArray(storedValue)) {
        storedValue = [storedValue];
      }

      // Push new qrItem into array
      storedValue.push(qrItem);
      qrItemsCollected[linkId] = storedValue;
    } else {
      const qItemIndex = qItemsIndexMap[linkId];

      // Assign either a qrItem array or a single qrItem based on whether it is a repeatGroup or not
      qrItemsCollected[linkId] =
        isRepeatItemAndNotCheckbox(qItems[qItemIndex]) &&
        qItems[qItemIndex].type === QItemType.Group
          ? [qrItem]
          : qrItem;
    }
  }

  // Generate an array of QuestionnaireResponseItems corresponding to its QuestionnaireItem indexes in sequence
  // Qitems with no answers has a default value of undefined
  return qItems.reduce(
    (mapping: (QuestionnaireResponseItem | QuestionnaireResponseItem[])[], qItem, i) => {
      const qrItemOrItems = qrItemsCollected[qItem.linkId];
      // If qItem is a repeat group, default its value to an array instead of undefined
      if (isRepeatItemAndNotCheckbox(qItem) && qItem.type === QItemType.Group) {
        mapping[i] = qrItemOrItems ? qrItemsCollected[qItem.linkId] : [];
      } else {
        mapping[i] = qrItemsCollected[qItem.linkId];
      }
      return mapping;
    },
    []
  );
}

/**
 * Generate a dictionary of QuestionnaireItems linkIds mapped to their respective array indexes <linkId, QItemIndex>
 * i.e. { ee2589d5: 0, f9aaa187: 1, 88cab112: 2 }
 * where ee2589d5, f9aaa187 and 88cab112 are linkIds of QItem0, QItem1 and QItem2 respectively
 *
 * @author Sean Fong
 */
export function mapQItemsIndex(qGroup: QuestionnaireItem): Record<string, number> {
  if (qGroup.item) {
    // generate a <linkId, QItemIndex> dictionary
    return qGroup.item.reduce((mapping: Record<string, number>, item, i) => {
      mapping[item.linkId] = i;
      return mapping;
    }, {});
  } else {
    return {};
  }
}
