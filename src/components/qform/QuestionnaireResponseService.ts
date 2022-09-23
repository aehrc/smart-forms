import questionnaireResponseData from '../../data/resources/715.R4.patient.json';
import {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  Reference
} from 'fhir/r5';

export class QuestionnaireResponseService implements QuestionnaireResponse {
  resourceType: 'QuestionnaireResponse';
  status: QuestionnaireResponse['status'];
  subject?: Reference;
  authored?: string;
  author?: Reference;
  item: QuestionnaireResponseItem[];

  constructor(questionnaire: Questionnaire) {
    this.resourceType = 'QuestionnaireResponse';
    this.status = 'in-progress';
    this.subject = { reference: questionnaireResponseData.subject.reference };
    this.authored = questionnaireResponseData.authored;
    this.author = undefined;
    this.item = [];
    this.initializeFormItem(questionnaire);
  }

  initializeFormItem(questionnaire: Questionnaire): void {
    if (this.item.length === 0 && questionnaire.item) {
      this.item[0] = {
        linkId: questionnaire.item[0].linkId,
        text: questionnaire.item[0].text,
        item: []
      };
    }
  }

  updateForm(newQrForm: QuestionnaireResponseItem) {
    this.item = [newQrForm];
  }

  // recursively remove items without answers from QuestionnaireResponseItem
  cleanQrItem(qrItem: QuestionnaireResponseItem): QuestionnaireResponseItem | undefined {
    const items = qrItem.item;
    if (items && items.length > 0) {
      const cleanedItems: QuestionnaireResponseItem[] = [];

      // only get items with answers
      items.forEach((item) => {
        const cleanedQrItem = this.cleanQrItem(item);
        if (cleanedQrItem) {
          cleanedItems.push(cleanedQrItem);
        }
      });

      return cleanedItems.length > 0 ? { ...qrItem, item: cleanedItems } : undefined;
    }

    // check answer when qrItem is a single question
    return qrItem['answer'] ? qrItem : undefined;
  }

  static createQrGroup(qItem: QuestionnaireItem): QuestionnaireResponseItem {
    return {
      linkId: qItem.linkId,
      text: qItem.text,
      item: []
    };
  }

  static createQrItem(qItem: QuestionnaireItem): QuestionnaireResponseItem {
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
  static updateLinkedItem(
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
}
