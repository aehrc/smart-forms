import {
  Expression,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem
} from 'fhir/r5';
import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';
import { CalculatedExpression } from '../interfaces/Interfaces';

/**
 * Create a questionnaireResponse from a given questionnaire fprm item
 * A questionnaire form item is the first item of a questionnaire
 *
 * @author Sean Fong
 */
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

/**
 * Remove items with no answers from a given questionnaireResponse
 * Generated questionnaireResponse only has items with answers
 *
 * @author Sean Fong
 */
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

/**
 * Create an empty group qrItem from a given group qItem
 *
 * @author Sean Fong
 */
export function createQrGroup(qItem: QuestionnaireItem): QuestionnaireResponseItem {
  return {
    linkId: qItem.linkId,
    text: qItem.text,
    item: []
  };
}

/**
 * Create an empty qrItem from a given qItem
 *
 * @author Sean Fong
 */
export function createQrItem(qItem: QuestionnaireItem): QuestionnaireResponseItem {
  return {
    linkId: qItem.linkId,
    text: qItem.text
  };
}

/**
 * Updates the QuestionnaireResponseItem group by adding/removing a new/modified child QuestionnaireResponseItem into/from a qrGroup
 * Takes either a single newQrItem or an array of newQrItems
 *
 * @author Sean Fong
 */
export function updateLinkedItem(
  newQrItem: QuestionnaireResponseItem | null,
  newQrItems: QuestionnaireResponseItem[] | null,
  qrGroup: QuestionnaireResponseItem,
  qItemsIndexMap: Record<string, number>
): void {
  if (qrGroup['item']) {
    // Get actual sequence indexes of qrItems present within a qrGroup
    // e.g. qrGroup has 4 fields but only the 2nd and 3rd field have values - resulting array is [1, 2]
    const qrItemsRealIndexArr = qrGroup.item.map((qrItem) => qItemsIndexMap[qrItem.linkId]);

    if (newQrItem && newQrItem.linkId in qItemsIndexMap) {
      if (qrGroup.item.length === 0) {
        qrGroup.item.push(newQrItem);
      } else {
        // Get actual sequence index of qrItem within qrGroup
        const newQrItemIndex = qItemsIndexMap[newQrItem.linkId];
        for (let i = 0; i < qrItemsRealIndexArr.length; i++) {
          // Add qrItem at the end of qrGroup if it is larger than the other indexes
          if (newQrItemIndex > qrItemsRealIndexArr[i]) {
            if (i === qrItemsRealIndexArr.length - 1) {
              qrGroup.item.push(newQrItem);
            }
            continue;
          }

          // Replace or delete qrItem at its supposed position if its index is already present within qrGroup
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

          // Add qrItem at its supposed position if its index is not present within qrGroup
          if (newQrItemIndex < qrItemsRealIndexArr[i]) {
            qrGroup.item.splice(i, 0, newQrItem);
            break;
          }
        }
      }
    } else if (newQrItems) {
      if (qrGroup.item.length === 0) {
        qrGroup.item.push(...newQrItems);
      } else {
        // Get actual sequence index of qrItems within qrGroup
        const newQrItemIndex = qItemsIndexMap[newQrItems[0].linkId];

        for (let i = 0; i < qrItemsRealIndexArr.length; i++) {
          // TODO need to break down these into individual functions
          // Add qrItem at the end of qrGroup if it is larger than the other indexes
          if (newQrItemIndex > qrItemsRealIndexArr[i]) {
            if (i === qrItemsRealIndexArr.length - 1) {
              qrGroup.item.push(...newQrItems);
            }
            continue;
          }

          // Replace or delete qrItem at its supposed position if its index is already present within qrGroup
          if (newQrItemIndex === qrItemsRealIndexArr[i]) {
            // Get number of repeatGroupItems with the same linkId present in qrGroup
            let repeatGroupItemCount = 0;
            while (newQrItemIndex === qrItemsRealIndexArr[i + repeatGroupItemCount]) {
              repeatGroupItemCount++;
            }

            if (newQrItems.length === repeatGroupItemCount) {
              for (let j = 0; j < newQrItems.length; j++) {
                qrGroup.item[i + j] = newQrItems[j];
              }
              break;
            } else if (newQrItems.length > repeatGroupItemCount) {
              for (let j = 0, k = repeatGroupItemCount; j < newQrItems.length; j++, k--) {
                if (k > 0) {
                  qrGroup.item[i + j] = newQrItems[j];
                } else {
                  qrGroup.item.splice(i + j, 0, newQrItems[j]);
                }
              }
              break;
            } else if (newQrItems.length < repeatGroupItemCount) {
              for (let j = 0; j < repeatGroupItemCount; j++) {
                if (j <= newQrItems.length - 1) {
                  qrGroup.item[i + j] = newQrItems[j];
                } else {
                  qrGroup.item.splice(i + j, 1);
                }
              }
              break;
            }
          }

          // Add qrItem at its supposed position if its index is not present within qrGroup
          if (newQrItemIndex < qrItemsRealIndexArr[i]) {
            for (let j = 0; j < newQrItems.length; j++) {
              qrGroup.item.splice(i + j, 0, newQrItems[j]);
            }
            break;
          }
        }
      }
    }
  }
}

/**
 * Evaluate all calculated expressions after a change has been made in a questionnaireRespoonse
 * Evaluation is done using fhirpath.evaluate function
 *
 * @author Sean Fong
 */
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
