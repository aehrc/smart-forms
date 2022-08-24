import questionnaireData from '../../data/resources/715.R4.json';
import { Questionnaire } from './QuestionnaireModel';

export class QuestionnaireReader {
  questionnaire: Questionnaire;

  constructor() {
    this.questionnaire = {
      name: questionnaireData.name,
      resourceType: questionnaireData.resourceType,
      title: questionnaireData.title,
      url: questionnaireData.url,
      items: questionnaireData.item[0].item
    };
  }

  printJson() {
    console.log(this.questionnaire);
  }
}
