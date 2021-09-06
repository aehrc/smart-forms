import { fhirclient } from 'fhirclient/lib/types';

export interface Questionnaire extends fhirclient.FHIR.Resource {
    resourceType: "Questionnaire";
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
    valueInteger: number;
    //valueDate: fhirclient.FHIR.date;
    //valueTime: fhirclient.FHIR.time;
    valueString: string;
    valueCoding: fhirclient.FHIR.Coding;
    //valueRefrence: Reference;
  }
  
  export interface EnableWhen extends fhirclient.FHIR.BackboneElement {
    question: string, 
    operator: fhirclient.FHIR.code, 
    answerInteger?: number,
    answerCoding?: fhirclient.FHIR.Coding,
    answerBoolean?: boolean
  }
  