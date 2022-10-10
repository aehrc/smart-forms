import {
  Expression,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem
} from 'fhir/r5';
import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';
import { CalculatedExpression } from '../../Interfaces';

export function createQuestionnaireResponse(
  questionnaireId: string | undefined,
  questionnaireFormItem: QuestionnaireItem
): QuestionnaireResponse {
  const qResponse: QuestionnaireResponse = {
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

  if (questionnaireId) {
    qResponse.questionnaire = `Questionnaire/${questionnaireId}`;
  }

  return qResponse;
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

export function evaluateCalculatedExpressions(
  questionnaire: Questionnaire,
  questionnaireResponse: QuestionnaireResponse,
  variables: Expression[],
  calculatedExpressions: Record<string, CalculatedExpression>
): Record<string, CalculatedExpression> | null {
  let isUpdated = false;
  const updatedCalculatedExpressions = { ...calculatedExpressions };
  if (Object.keys(calculatedExpressions).length > 0 && questionnaireResponse.item) {
    const context: any = { questionnaire: questionnaire, resource: questionnaireResponse };
    const qrForm = questionnaireResponse.item[0];

    if (variables.length > 0 && qrForm) {
      variables.forEach((variable) => {
        context[`${variable.name}`] = fhirpath.evaluate(
          qrForm,
          {
            base: 'QuestionnaireResponse.item',
            expression: `${variable.expression}`
          },
          context,
          fhirpath_r4_model
        );
      });

      for (const linkId in calculatedExpressions) {
        const result = fhirpath.evaluate(
          questionnaireResponse,
          calculatedExpressions[linkId].expression,
          context,
          fhirpath_r4_model
        );

        if (result.length > 0) {
          if (calculatedExpressions[linkId].value != result[0]) {
            isUpdated = true;
            updatedCalculatedExpressions[linkId].value = result[0];
          }
        }
      }
    }
  }
  return isUpdated ? updatedCalculatedExpressions : null;
}
