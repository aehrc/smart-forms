import { Injectable } from '@angular/core';
import { fhirclient } from 'fhirclient/lib/types';
import { Observable, ReplaySubject, Subject, of, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import Client from 'fhirclient/lib/Client';
import * as FHIR from 'fhirclient';
import { Parameters } from './fhir.service';

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

  private responseServerUrl = "https://sqlonfhir-r4.azurewebsites.net/fhir/";

  private fhirClient: Client;

  constructor() { 
    this.fhirClient = FHIR.client({ serverUrl: this.responseServerUrl });
  }

  id: string;

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

  create(qr: QuestionnaireResponse) : Observable<fhirclient.FHIR.Resource> {
    let result = this.fhirClient.create(qr);
    return from(result)
  }

  validate(qr: QuestionnaireResponse) : Observable<fhirclient.FHIR.Resource> {
    var parameters: Parameters = {
      "resourceType": "Parameters",
      "parameter": [
        {
            "name": "resource",
            "resource": qr
        }]                        
    };

    var headers = {
      "Cache-Control": "no-cache", 
      "Content-Type": "application/json+fhir; charset=UTF-8",
      "Accept": "application/json+fhir; charset=utf-8"
    };
    var operation = "QuestionnaireResponse/$validate";

    let result = this.fhirClient.request({
      url: operation,
      method: "POST",
      body: JSON.stringify(parameters),
      headers: headers
    });
    
    return from(result);
  }

  extractInstance(id: string) {
    var parameters: Parameters = {
      "resourceType": "Parameters",
      "parameter": [ ]                        
    };

    var headers = {
      "Cache-Control": "no-cache", 
      "Content-Type": "application/json+fhir; charset=UTF-8",
      "Accept": "application/json+fhir; charset=utf-8"
    };
    var operation = "QuestionnaireResponse/" + id +"/$extract";
    //var operation = "QuestionnaireResponse/$extract";

    let result = this.fhirClient.request({
      url: operation,
      method: "POST",
      body: JSON.stringify(parameters),
      headers: headers
    });
    
    return from(result);
  }

  extract(qr: QuestionnaireResponse) {
    var parameters: Parameters = {
      "resourceType": "Parameters",
      "parameter": [
        {
            "name": "resource",
            "resource": qr
        }]                        
    };

    var headers = {
      "Cache-Control": "no-cache", 
      "Content-Type": "application/json+fhir; charset=UTF-8",
      "Accept": "application/json+fhir; charset=utf-8"
    };
    
    var operation = "QuestionnaireResponse/$extract";

    let result = this.fhirClient.request({
      url: operation,
      method: "POST",
      body: JSON.stringify(parameters),
      headers: headers
    });
    
    return from(result);
  }
}
