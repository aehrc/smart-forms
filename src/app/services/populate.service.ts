import { Injectable } from '@angular/core';

import Client from 'fhirclient/lib/Client';

import { client as fhirclient } from 'fhirclient'; 
import { Parameters } from './fhir.service';
import { QuestionnaireResponse } from './questionnaire-response.service';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PopulateService {

  populateServerUrl = "https://sqlonfhir-r4.azurewebsites.net/fhir/";

  private fhirClient: Client;

  constructor() { 
    this.fhirClient = fhirclient(this.populateServerUrl);
  }

  populate(questionnaireId: string, parameters: Parameters): Observable<QuestionnaireResponse> {
    var headers = {
      "Cache-Control": "no-cache", 
      "Content-Type": "application/json+fhir; charset=UTF-8",
      "Accept": "application/json+fhir; charset=utf-8"
    };
    var operation = "Questionnaire/" + questionnaireId + "/$populate";

    let result = this.fhirClient.request({
      url: operation,
      method: "POST",
      body: JSON.stringify(parameters),
      headers: headers
    });
    
    return from(result);
  }
}
