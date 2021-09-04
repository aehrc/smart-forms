import { Injectable } from '@angular/core';
import { fhirclient } from 'fhirclient/lib/types';
import { Observable, ReplaySubject, Subject, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

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

  findItem(linkId: string) : Observable<QuestionnaireResponseItem> {
    return this.getQuestionnaireResponse().pipe(switchMap( qr => { 

      let qItem: QuestionnaireResponseItem = null;

      for (let index = 0; index < qr.item.length; index++) {
          qItem = this._findItem(qr.item[index], linkId);
          if (qItem) {
              break;
          }
      }
      if (qItem)
        return of(qItem);
      else
        return of<QuestionnaireResponseItem>();
    }));
  }

  private _findItem(item: QuestionnaireResponseItem, linkId: string): QuestionnaireResponseItem {
    if (item.linkId == linkId) {
      return item;
    }

    if (item.item) {
      for (let index = 0; index < item.item.length; index++) {
        var i = this._findItem(item.item[index], linkId);
        if (i) {
          return i;
        }
      }                
    }
    return null;
  }
}
