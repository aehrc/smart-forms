import { QuestionnaireResponse } from 'fhir/r5';

export class QuestionnaireResponseProvider {
  questionnaireResponse: QuestionnaireResponse;

  constructor() {
    this.questionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress'
    };
  }

  setQuestionnaireResponse(questionnaireResponse: QuestionnaireResponse) {
    this.questionnaireResponse = questionnaireResponse;
  }
}
