import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  of,
  Observable,
  ReplaySubject,
  Subject,
  EMPTY,
  from,
  Subscription,
} from "rxjs";

import { FHIRService, Parameters } from "./fhir.service";

import { Questionnaire } from "./questionnaire.model";
import { QuestionnaireResponse } from "./questionnaire-response.service";
import { mergeMap } from "rxjs/operators";
import { PopulateService } from "./populate.service";
import { PatientService } from "./patient.service";
import Client from "fhirclient/lib/Client";
import * as FHIR from "fhirclient";
import { fhirclient as fhirTypes } from "fhirclient/lib/types";
import { SpinnerService } from "./spinner.service";

export interface QuestionnaireCandidate {
  name: string;
  title: string;
  url?: string;
  id?: string;
  resource?: Questionnaire;
}

@Injectable({
  providedIn: "root",
})
export class QuestionnaireService {
  get currentServer(): string {
    if (!this.fhirClient) {
      return "local";
    } else {
      return this.fhirClient.state.serverUrl;
    }
  }

  set currentServer(serverUrl: string) {
    if (serverUrl === "local") {
      this.fhirClient = null;
    } else {
      this.fhirClient = FHIR.client({ serverUrl: serverUrl });
    }
  }

  get batchQuery$(): Observable<fhirTypes.FHIR.Resource> {
    return this._batchQuery$;
  }

  get questionnaire$() {
    return this._questionnaire$;
  }

  get isInitialised(): boolean {
    return this.initialised;
  }

  constructor(
    private http: HttpClient,
    private fhirService: FHIRService,
    private patientService: PatientService,
    private populateService: PopulateService,
    private spinnerService: SpinnerService
  ) {}

  servers = [
    "https://lforms-fhir.nlm.nih.gov/baseR4",
    "https://sqlonfhir-r4.azurewebsites.net/fhir",
  ];

  private fhirClient: Client;

  private _batchQuery$: Observable<fhirTypes.FHIR.Resource> = EMPTY;

  private localQuestionnaires: QuestionnaireCandidate[] = [
    /*    {
          "name": "AU-MBS-715",
          "title": "Aboriginal and Torres Strait Islander health check – Adults (25–49 years)",
          "url": "data/AU-MBS-715.R4.json"
        },
    */
    {
      name: "MBS715-AnswerValueSetOnlyUrl",
      title:
        "Aboriginal and Torres Strait Islander health check – Adults (25–49 years) - AVS only url for testing",
      url: "data/715.R4-AnswerValueSetOnlyUrl.json",
    },
    {
      name: "MBS715",
      title:
        "Aboriginal and Torres Strait Islander health check – Adults (25–49 years)",
      url: "data/715.R4.json",
    },
    {
      name: "cvd-risk",
      title: "CVD Risk Assessment",
      url: "data/CVD Risk.json",
    },
    {
      name: "cvd-check",
      title: "Australian absolute cardiovascular disease risk calculator",
      url: "data/CVD Check.json",
    },
    {
      name: "HISO-10071:2019-cvd-risk",
      title: "NZ CVD Risk Assessment",
      url: "data/CVD Risk-HISO.json",
    },
  ];

  private questionnaireSubject: Subject<Questionnaire> =
    new ReplaySubject<Questionnaire>(1);

  private _questionnaire$ = this.questionnaireSubject.asObservable();

  private initialised: boolean;

  private readLocalSubscription: Subscription;

  setQuestionnaire(questionnaire: Questionnaire) {
    this.questionnaireSubject.next(questionnaire);

    this.initialised = true;
  }

  getAllLocal(): Observable<QuestionnaireCandidate[]> {
    return of(this.localQuestionnaires);
  }

  searchLocal(name: string): Observable<QuestionnaireCandidate[]> {
    return of(
      this.localQuestionnaires.filter((item) =>
        item.name.toLocaleLowerCase().includes(name.toLocaleLowerCase())
      )
    );
  }

  readLocal$(url: string): Observable<Questionnaire> {
    return this.http.get<Questionnaire>(url);
  }

  populate(questionnaire: Questionnaire): Observable<QuestionnaireResponse> {
    if (questionnaire.contained && questionnaire.contained.length > 0) {
      const query = questionnaire.contained[0];

      return this.patientService.patient$.pipe(
        mergeMap((patient) => {
          // start spinner ...
          this.spinnerService.show();

          const patientId = patient.id;
          query.entry.forEach((entry) => {
            // only first occurence will be replaced
            entry.request.url = entry.request.url.replace(
              "{{%LaunchPatient.id}}",
              patientId
            );
          });

          this._batchQuery$ = this.fhirService.batch(query);

          return this._batchQuery$.pipe(
            mergeMap((queryResponse) => {
              const parameters: Parameters = {
                resourceType: "Parameters",
                parameter: [
                  {
                    name: "subject",
                    valueReference: {
                      reference: "",
                      display: "",
                    },
                  },
                  {
                    name: "LaunchPatient",
                    resource: patient,
                  },
                  {
                    name: "PrePopQuery",
                    resource: queryResponse,
                  },
                ],
              };

              const questionnaireResponse$ = this.populateService.populate(
                questionnaire.id,
                parameters
              );

              this.spinnerService.hide();

              return questionnaireResponse$;
            })
          );
        })
      );
    } else {
      return EMPTY;
    }
  }

  search(title: string): Observable<fhirTypes.FHIR.Bundle> {
    if (this.fhirClient) {
      const result = this.searchFhir({
        type: "Questionnaire",
        query: { title: title },
        headers: { "Cache-Control": "no-cache" },
      }).catch((error) => {
        console.log(error);
      });
      return from(result);
    } else {
      return of<fhirTypes.FHIR.Bundle>();
    }
  }

  private searchFhir(searchConfig) {
    const searchParams = new URLSearchParams();
    if (searchConfig.query) {
      const queryVars = searchConfig.query;
      const queryVarKeys = Object.keys(queryVars);
      let key;
      for (let i = 0, len = queryVarKeys.length; i < len; ++i) {
        key = queryVarKeys[i];
        searchParams.append(key, queryVars[key]);
      }
    }
    return this.fhirClient.request({
      url: searchConfig.type + "?" + searchParams,
      headers: searchConfig.headers,
    });
  }

  searchCandidates(name: string): Observable<QuestionnaireCandidate[]> {
    if (!this.fhirClient) {
      return this.searchLocal(name);
    } else {
      return this.search(name).pipe(
        mergeMap((response) => {
          const qList: QuestionnaireCandidate[] = [];
          if (response && response.entry) {
            for (let i = 0; i < response.entry.length; i++) {
              const q = response.entry[i].resource;
              const qc: QuestionnaireCandidate = {
                name: q.name,
                // url: string;
                title: q.title,
                //                      status: q.status,
                id: q.id,
                resource: q as Questionnaire,
              };
              qList.push(qc);
            }
          }
          return of(qList); // new QuestionnaireCandidate { items: qList, total: response.total} ;
        })
      );
    }
  }

  setQuestionnaireByLocalUrl(url: string) {
    if (url) {
      if (this.readLocalSubscription !== undefined) {
        this.readLocalSubscription.unsubscribe();
      }

      this.readLocalSubscription = this.readLocal$(url).subscribe((x) => {
        this.questionnaireSubject.next(x);
        this.initialised = true;
      });
    }
  }

  update(questionnaire: Questionnaire): Observable<fhirTypes.FHIR.Resource> {
    return from(
      this.fhirClient
        .update(questionnaire)
        .catch((reason) =>
          JSON.parse(reason.message.substr(reason.message.indexOf("\n\n") + 2))
        )
    );
  }
}
