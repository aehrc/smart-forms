import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, Observable } from 'rxjs';

import { fhirclient } from 'fhirclient/lib/types';

export interface QuestionnaireItem {
  name: string;
  title: string;
  url: string;
}

export interface Questionnaire extends fhirclient.FHIR.Resource {
  resourceType: "Questionnaire";
}

@Injectable({
  providedIn: 'root'
})
export class QuestionnaireService {

  private localQuestionnaires: QuestionnaireItem[] = [
    /*    {
          "name": "AU-MBS-715",
          "title": "Aboriginal and Torres Strait Islander health check – Adults (25–49 years)",
          "url": "data/AU-MBS-715.R4.json"
        },
    */
    {
        "name": "MBS715",
        "title": "Aboriginal and Torres Strait Islander health check – Adults (25–49 years)",
        "url": "data/715.R4.json"
    }  
  ];

  constructor(private http: HttpClient) { }
  
  getAllLocal(): Observable<QuestionnaireItem[]> {
    return of(this.localQuestionnaires);
  }

  searchLocal(name: string): Observable<QuestionnaireItem[]> {
    return of(this.localQuestionnaires.filter(item => item.name.includes(name)));
  }

  readLocal(url: string): Observable<Questionnaire> {
    return this.http.get<Questionnaire>(url);
  }
}
