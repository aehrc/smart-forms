import { Questionnaire, QuestionnaireResponse } from 'fhir/r5';
export class ResourcePickerStore {
  questionnaires: Record<string, Questionnaire>;
  qResponsesOfQuestionnaire: Record<string, Record<string, QuestionnaireResponse>>;

  constructor() {
    this.questionnaires = {};
    this.qResponsesOfQuestionnaire = {};
  }

  addQuestionnaires(questionnaires: Questionnaire[]) {
    questionnaires.forEach((questionnaire) => {
      const id = questionnaire.id;
      if (id) {
        if (!this.questionnaires[id]) {
          this.questionnaires[id] = questionnaire;
        }
      }
    });
  }

  addQuestionnaireResponses(
    questionnaireId: string,
    questionnaireResponses: QuestionnaireResponse[]
  ) {
    const selectedQuestionnaire = { ...this.qResponsesOfQuestionnaire[questionnaireId] };

    questionnaireResponses.forEach((qResponse) => {
      const lastUpdated = qResponse.meta?.lastUpdated;

      if (lastUpdated) {
        if (!selectedQuestionnaire[lastUpdated]) {
          selectedQuestionnaire[lastUpdated] = qResponse;
        }
      }
    });

    this.qResponsesOfQuestionnaire[questionnaireId] = selectedQuestionnaire;
  }
}
