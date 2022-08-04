import { fhirclient } from 'fhirclient/lib/types';
import {ValueSet} from './value-set.model';

export interface Questionnaire extends fhirclient.FHIR.Resource {
    resourceType: "Questionnaire";
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
    item: QuestionnaireItem[];
  }

  export interface AnswerOption extends fhirclient.FHIR.BackboneElement {
    valueInteger?: number;
    //valueDate: fhirclient.FHIR.date;
    //valueTime: fhirclient.FHIR.time;
    valueString?: string;
    valueCoding?: fhirclient.FHIR.Coding;
    //valueRefrence: Reference;
  }

  export type OpenChoiceContent = OpenChoiceAnswerOption | OpenChoiceValueSet;

  export interface OpenChoiceAnswerOption {
    type: "ANSWER_OPTION";
    content: AnswerOption[];
  }

  export interface OpenChoiceValueSet {
    type: "VALUE_SET";
    content: ValueSet;
  }

  export interface EnableWhen extends fhirclient.FHIR.BackboneElement {
    question: string,
    operator: fhirclient.FHIR.code,
    answerInteger?: number,
    answerCoding?: fhirclient.FHIR.Coding,
    answerBoolean?: boolean
  }
