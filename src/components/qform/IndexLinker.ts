import { QuestionnaireItem } from '../questionnaire/QuestionnaireModel';
import { QuestionnaireResponseItem } from '../questionnaireResponse/QuestionnaireResponseModel';

function IndexLinker(qItems: QuestionnaireItem[], qrItems: QuestionnaireResponseItem[]) {
  const qrItemsDict = qrItems.reduce((mapping: Record<string, QuestionnaireResponseItem>, item) => {
    mapping[item.linkId] = { ...item };
    return mapping;
  }, {});

  return qItems.reduce((mapping: QuestionnaireResponseItem[], item, i) => {
    mapping[i] = qrItemsDict[item.linkId];
    return mapping;
  }, []);
}

export default IndexLinker;
