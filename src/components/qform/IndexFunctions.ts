import { QuestionnaireItem } from '../questionnaire/QuestionnaireModel';
import { QuestionnaireResponseItem } from '../questionnaireResponse/QuestionnaireResponseModel';

// get supposed indexes of qrItems based on qItems
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

// create am index map of qItems linkIds
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
