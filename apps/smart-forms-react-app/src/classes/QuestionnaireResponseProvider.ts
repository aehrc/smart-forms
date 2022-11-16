import { Bundle, QuestionnaireResponse } from 'fhir/r5';

const cleanQResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress'
};

export class QuestionnaireResponseProvider {
  questionnaireResponse: QuestionnaireResponse;
  batchResponse: Bundle | null;

  constructor() {
    this.questionnaireResponse = cleanQResponse;
    this.batchResponse = null;
  }

  setQuestionnaireResponse(questionnaireResponse: QuestionnaireResponse) {
    this.questionnaireResponse = questionnaireResponse;
  }

  setBatchResponse(batchResponse: Bundle) {
    this.batchResponse = batchResponse;
  }

  clearQuestionnaireResponse() {
    this.questionnaireResponse = cleanQResponse;
  }
}
