import { fhirclient } from 'fhirclient/lib/types';

export interface QuestionnaireResponse extends fhirclient.FHIR.Resource {
  resourceType: 'QuestionnaireResponse';
  status: fhirclient.FHIR.code;
  subject?: fhirclient.FHIR.Reference;
  authored?: fhirclient.FHIR.dateTime;
  author?: fhirclient.FHIR.Reference;
  item: QuestionnaireResponseItem[];
}

export interface QuestionnaireResponseItem extends fhirclient.FHIR.BackboneElement {
  linkId: string;
  definition?: fhirclient.FHIR.uri;
  text?: string;
  answer?: QuestionnaireResponseAnswer[];
  item?: QuestionnaireResponseItem[];
}

export interface QuestionnaireResponseAnswer extends fhirclient.FHIR.BackboneElement {
  valueBoolean?: boolean;
  valueDecimal?: number;
  valueInteger?: number;
  valueDate?: fhirclient.FHIR.dateTime;
  valueDateTime?: fhirclient.FHIR.dateTime;
  valueString?: string;
  valueCoding?: fhirclient.FHIR.Coding;
  valueQuantity?: QuestionnaireResponseAnswerValueQuantity;
  valueReference?: fhirclient.FHIR.Reference;
  item?: QuestionnaireResponseItem[];
}

export interface QuestionnaireResponseAnswerValueQuantity extends fhirclient.FHIR.Element {
  value: number;
  unit: string;
}
