import questionnaireResponseData from '../../data/resources/715.R4.response.json';
import { QuestionnaireResponse } from './QuestionnaireResponseModel';

export class QuestionnaireResponseService {
  questionnaireResponse: QuestionnaireResponse;

  constructor() {
    this.questionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: questionnaireResponseData.status,
      subject: { reference: questionnaireResponseData.subject.reference },
      authored: questionnaireResponseData.authored,
      author: undefined,
      item: questionnaireResponseData.item
    };
  }
}
