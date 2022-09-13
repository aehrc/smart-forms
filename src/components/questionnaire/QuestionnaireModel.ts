import { fhirclient } from 'fhirclient/lib/types';

export interface Questionnaire extends fhirclient.FHIR.Resource {
  resourceType: fhirclient.FHIR.code;
  url: fhirclient.FHIR.uri;
  name: string;
  title: string;
  item: QuestionnaireItem[];
}

export interface QuestionnaireItem extends fhirclient.FHIR.BackboneElement {
  linkId: string;
  text?: string;
  type: fhirclient.FHIR.code;
  enableWhen?: EnableWhen[];
  required?: boolean;
  repeats?: boolean;
  answerValueSet?: string;
  answerOption?: AnswerOption[];
  extension?: ItemExtension[];
  item?: QuestionnaireItem[];
}

export interface AnswerOption extends fhirclient.FHIR.BackboneElement {
  valueInteger?: number;
  valueString?: string;
  valueCoding?: fhirclient.FHIR.Coding;
}

export type OpenChoiceContent = OpenChoiceAnswerOption | OpenChoiceValueSet;

export interface OpenChoiceAnswerOption {
  type: 'ANSWER_OPTION';
  content: AnswerOption[];
}

export interface OpenChoiceValueSet {
  type: 'VALUE_SET';
  content: ValueSet;
}

export interface ValueSet extends fhirclient.FHIR.Resource {
  resourceType: 'ValueSet';
}

export interface EnableWhen extends fhirclient.FHIR.BackboneElement {
  question: string;
  operator: fhirclient.FHIR.code;
  answerInteger?: number;
  answerCoding?: fhirclient.FHIR.Coding;
  answerBoolean?: boolean;
}

export interface ItemExtension extends fhirclient.FHIR.Extension {
  url: fhirclient.FHIR.uri;
  valueCodeableConcept?: fhirclient.FHIR.CodeableConcept;
  valueCode?: fhirclient.FHIR.code;
}
