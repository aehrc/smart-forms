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

  static createQrItem(qItem: QuestionnaireItem): QuestionnaireResponseItem {
    return {
      linkId: qItem.linkId,
      item: []
    };
  }
}
