import questionnaireData from '../../data/resources/715.R4.json';
import { Questionnaire, QuestionnaireItem } from './QuestionnaireModel';
import { fhirclient } from 'fhirclient/lib/types';

export class QuestionnaireService implements Questionnaire {
  resourceType: fhirclient.FHIR.code;
  url: fhirclient.FHIR.uri;
  name: string;
  title: string;
  item: QuestionnaireItem[];

  constructor() {
    this.resourceType = questionnaireData.resourceType;
    this.url = questionnaireData.url;
    this.name = questionnaireData.name;
    this.title = questionnaireData.title;
    this.item = questionnaireData.item;
  }
}
