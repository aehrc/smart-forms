import questionnaireData from '../../data/resources/715.R4.json';
import { Questionnaire } from './QuestionnaireModel';

export class QuestionnaireService {
  questionnaire: Questionnaire;

  constructor() {
    this.questionnaire = {
      name: questionnaireData.name,
      resourceType: questionnaireData.resourceType,
      title: questionnaireData.title,
      url: questionnaireData.url,
      item: questionnaireData.item[0].item
    };
  }
}
