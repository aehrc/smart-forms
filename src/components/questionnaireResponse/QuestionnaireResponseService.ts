import questionnaireResponseData from '../../data/resources/715.R4.response.json';
import { QuestionnaireResponse, QuestionnaireResponseItem } from './QuestionnaireResponseModel';
import { Questionnaire, QuestionnaireItem } from '../questionnaire/QuestionnaireModel';
import { fhirclient } from 'fhirclient/lib/types';

export class QuestionnaireResponseService implements QuestionnaireResponse {
  resourceType: 'QuestionnaireResponse';
  status: fhirclient.FHIR.code;
  subject?: fhirclient.FHIR.Reference;
  authored?: fhirclient.FHIR.dateTime;
  author?: fhirclient.FHIR.Reference;
  item: QuestionnaireResponseItem[];

  constructor(questionnaire: Questionnaire) {
    this.resourceType = 'QuestionnaireResponse';
    this.status = questionnaireResponseData.status;
    this.subject = { reference: questionnaireResponseData.subject.reference };
    this.authored = questionnaireResponseData.authored;
    this.author = undefined;
    this.item = questionnaireResponseData.item;
    this.initializeFormItem(questionnaire);
  }

  initializeFormItem(questionnaire: Questionnaire): void {
    if (this.item === []) {
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

  static createQrGroup(qItem: QuestionnaireItem): QuestionnaireResponseItem {
    return {
      linkId: qItem.linkId,
      item: []
    };
  }

  static createQrItem(qItem: QuestionnaireItem): QuestionnaireResponseItem {
    return {
      linkId: qItem.linkId
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
              qrGroup.item[i] = newQrItem;
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
