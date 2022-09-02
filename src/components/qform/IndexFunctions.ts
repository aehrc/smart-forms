import { QuestionnaireItem } from '../questionnaire/QuestionnaireModel';
import { QuestionnaireResponseItem } from '../questionnaireResponse/QuestionnaireResponseModel';

/**
 * Stores indexes of QuestionnaireResponseItems relative to its QuestionnaireItem in an array.
 * Indexes with no QuestionnaireResponseItems are set to undefined.
 *
 * @author Sean Fong
 */
export function getQrItemsIndex(
  qItems: QuestionnaireItem[],
  qrItems: QuestionnaireResponseItem[]
): any[] {
  const qrItemsDict = qrItems.reduce((mapping: Record<string, QuestionnaireResponseItem>, item) => {
    mapping[item.linkId] = { ...item };
    return mapping;
  }, {});

  return qItems.reduce((mapping: QuestionnaireResponseItem[], item, i) => {
    mapping[i] = qrItemsDict[item.linkId];
    return mapping;
  }, []);
}

/**
 * Creates a mapping of QuestionnaireItems linkIds to their respective array indexes
 *
 * @author Sean Fong
 */
export function mapQItemsIndex(qGroup: QuestionnaireItem): Record<string, number> {
  if (qGroup.item) {
    return qGroup.item.reduce((mapping: Record<string, number>, item, i) => {
      mapping[item.linkId] = i;
      return mapping;
    }, {});
  } else {
    return {};
  }
}
