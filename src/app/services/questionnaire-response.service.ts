import { Injectable } from '@angular/core';
import { fhirclient } from 'fhirclient/lib/types';
import { Observable, ReplaySubject, Subject } from 'rxjs';

export interface QuestionnaireResponse extends fhirclient.FHIR.Resource {
  resourceType: "QuestionnaireResponse";
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
    //valueTime?: fhirclient.FHIR.time;
    valueString?: string;
    valueCoding?: fhirclient.FHIR.Coding;
    //valueQuantity?: ;
    valueReference?: fhirclient.FHIR.Reference;  
    item?: QuestionnaireResponseItem[];  
}

export const isOfType = <T>(varToBeChecked: any, propertyToCheckFor: keyof T) 
  : varToBeChecked is T => 
  (varToBeChecked as T)[propertyToCheckFor] !== undefined;

@Injectable({
  providedIn: 'root'
})
export class QuestionnaireResponseService {

  private questionnaireResponseSubject: Subject<QuestionnaireResponse> = new ReplaySubject<QuestionnaireResponse>(1);

  private setQuestionnaireResponse(questionnaireResponse: QuestionnaireResponse) {
    this.questionnaireResponseSubject.next(questionnaireResponse);
  }

  getQuestionnaireResponse(): Observable<QuestionnaireResponse> {
    return this.questionnaireResponseSubject.asObservable();
  }

  constructor() { }

  onQuestionnaireResponseChanged(questionnaireResponse: QuestionnaireResponse): void {
    this.setQuestionnaireResponse(questionnaireResponse);
  }
}
