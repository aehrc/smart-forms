import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, Observable, ReplaySubject, Subject, EMPTY } from 'rxjs';

import { fhirclient } from 'fhirclient/lib/types';
import { FHIRService, Parameters } from './fhir.service';

import { QuestionnaireResponse } from './questionnaire-response.service';
import { mergeMap } from 'rxjs/operators';
import { PopulateService } from './populate.service';
import { PatientService } from './patient.service';

export interface QuestionnaireCandidate {
  name: string;
  title: string;
  url: string;
}

export interface Questionnaire extends fhirclient.FHIR.Resource {
  resourceType: "Questionnaire";
  item: QuestionnaireItem[];
}

export interface QuestionnaireItem extends fhirclient.FHIR.BackboneElement {
  linkId: string;
  text: string;
  type: fhirclient.FHIR.code;
  required: boolean;
  repeats: boolean;
  answerOption: AnswerOption[];
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

@Injectable({
  providedIn: 'root'
})
export class QuestionnaireService {

  private localQuestionnaires: QuestionnaireCandidate[] = [
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

  private questionnaireSubject: Subject<Questionnaire> = new ReplaySubject<Questionnaire>();

  set questionnaire(questionnaire: Questionnaire) {
    this.questionnaireSubject.next(questionnaire);
  }

  getQuestionnaire(): Observable<Questionnaire> {
    return this.questionnaireSubject.asObservable();
  }

  constructor(private http: HttpClient, 
    private fhirService: FHIRService, 
    private patientService: PatientService,
    private populateService: PopulateService) {       
  }
  
  getAllLocal(): Observable<QuestionnaireCandidate[]> {
    return of(this.localQuestionnaires);
  }

  searchLocal(name: string): Observable<QuestionnaireCandidate[]> {
    return of(this.localQuestionnaires.filter(item => item.name.includes(name)));
  }

  readLocal(url: string): Observable<Questionnaire> {
    return this.http.get<Questionnaire>(url);
  }

  populate(questionnaire: Questionnaire) : Observable<QuestionnaireResponse> {

    if (questionnaire.contained && questionnaire.contained.length > 0) {

      var query = questionnaire.contained[0];

      return this.patientService.patient$
      .pipe(mergeMap(patient => {

        var patientId = patient.id;
        query.entry.forEach(entry => {
          // only first occurence will be replaced
          entry.request.url = entry.request.url.replace("{{%LaunchPatient.id}}", patientId); 
        });

        return this.fhirService.batch(query)
        .pipe(mergeMap(queryResponse => {

          var parameters: Parameters = {
            "resourceType": "Parameters",
            "parameter": [
              {
                  "name": "subject",
                  "valueReference": {
                      "reference": "",
                      "display": ""
                  }
              },
              {
                  "name": "LaunchPatient",
                  "resource": patient
              },
              {
                  "name": "PrePopQuery",
                  "resource": queryResponse
              }]                        
          };

          return this.populateService.populate(questionnaire.id, parameters);
        }));
      }));
    }
    else
      return EMPTY;
  }
}
