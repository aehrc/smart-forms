import questionnaireData from '../../data/resources/715.R4-modified.json';
import { Questionnaire, QuestionnaireItem } from 'fhir/r5';

export class QuestionnaireService implements Questionnaire {
  resourceType: 'Questionnaire';
  url: string;
  name: string;
  title: string;
  status: Questionnaire['status'];
  item: QuestionnaireItem[];

  constructor() {
    this.resourceType = 'Questionnaire';
    this.url = questionnaireData.url;
    this.name = questionnaireData.name;
    this.title = questionnaireData.title;
    this.status = 'draft';
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.item = questionnaireData.item;
  }
}
