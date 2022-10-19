import { QuestionnaireResponse } from 'fhir/r5';

const cleanQResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress'
};

export class QuestionnaireResponseProvider {
  questionnaireResponse: QuestionnaireResponse;

  constructor() {
    this.questionnaireResponse = cleanQResponse;
  }

  setQuestionnaireResponse(questionnaireResponse: QuestionnaireResponse) {
    this.questionnaireResponse = questionnaireResponse;
  }

  clearQuestionnaireResponse() {
    this.questionnaireResponse = cleanQResponse;
  }
}
