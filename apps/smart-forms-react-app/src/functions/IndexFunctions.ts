import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';

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
  qrItems: QuestionnaireResponseItem[]
): QuestionnaireResponseItem[] {
  // TODO we need to fix this up to store repeatGroups
  // generate a <linkId, QrItem> dictionary
  const qrItemsDict = qrItems.reduce((mapping: Record<string, QuestionnaireResponseItem>, item) => {
    mapping[item.linkId] = { ...item };
    return mapping;
  }, {});

  // generate an array of QuestionnaireResponseItems corresponding to its QuestionnaireItem indexes an array.
  return qItems.reduce((mapping: QuestionnaireResponseItem[], item, i) => {
    mapping[i] = qrItemsDict[item.linkId];
    return mapping;
  }, []);
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
