import questionnaireData from '../../data/resources/715.R4.json';
import { FhirResource, Questionnaire, QuestionnaireItem } from 'fhir/r5';

export class QuestionnaireService implements Questionnaire {
  resourceType: 'Questionnaire';
  id: string;
  url: string;
  name: string;
  title: string;
  status: Questionnaire['status'];
  item: QuestionnaireItem[];
  contained: FhirResource[];

  constructor() {
    this.resourceType = 'Questionnaire';
    this.id = questionnaireData.id;
    this.url = questionnaireData.url;
    this.name = questionnaireData.name;
    this.title = questionnaireData.title;
    this.status = 'draft';
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.item = questionnaireData.item;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.contained = questionnaireData.contained;
  }
}
