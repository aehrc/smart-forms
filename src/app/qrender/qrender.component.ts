import { Component, OnInit } from '@angular/core';
import Client from 'fhirclient/lib/Client';

import { fhirclient } from 'fhirclient/lib/types';
import { EMPTY, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { FHIRService } from '../services/fhir.service';
import { PatientService } from '../services/patient.service';
import { QuestionnaireService } from '../services/questionnaire.service';
import { Questionnaire } from '../services/questionnaire.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'questionnaire-render',
  templateUrl: './qrender.component.html',
  styleUrls: ['./qrender.component.css']
})
export class QRenderComponent implements OnInit {

  public patient: fhirclient.FHIR.Patient = null;

  navbarOpen = false;

  constructor(private route: ActivatedRoute, 
    private patientService: PatientService, 
    private fhirService: FHIRService, 
    private questionnaireService: QuestionnaireService) { }

  ngOnInit(): void {
    var questionnaireName = "MBS715";
    const fragment = this.route.snapshot.fragment;

    if (fragment)
      questionnaireName = fragment;

    var fhirServerUrl = 'http://www.demo.oridashi.com.au:8109';  // oridashi public server

    //if (this.fhir.isAuthorizing()) {
    var client = this.fhirService.getClient();
    if (!client) {  

      this.fhirService.authorizeReady()
      .then(fhirService => { 
        client = fhirService.getClient()
        console.log("FHIR client authorized"); 
        //console.log(client);
        /*
        this.patientService.getPatient()
        .then(patient => { 
          console.log("getPatient fulfilled");
          console.log(patient);
          this.patient = patient;
        })
        .catch( reason => console.log("getPatient rejected: " + reason));
        */
        this.initialise(questionnaireName);
      })
      .catch( reason => { 
        console.log("FHIRService.authorizeReady() rejected: " + reason);
        this.fhirService.createClient(fhirServerUrl);
        this.initialise(questionnaireName);
      });
    }    
    else {
      
        console.log("FHIR client Initialised");
        //console.log(client);
      /*
        this.patientService.getPatient()
        .then(patient => { 
          console.log("getPatient fulfilled");
          console.log(patient);
          this.patient = patient;
        })
        .catch( reason => console.log("getPatient rejected: " + reason));
      */
     this.initialise(questionnaireName);
    }
    /*  else {
        console.log("FHIR client not initialised");
      }
    }*/


  }

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  private initialise(questionnaireName: string): void {
    this.patientService.getPatient()
    .then(patient => { 
      this.patient = patient;
    })
    .catch(reason => console.log("getPatient rejected: " + reason));

    if (!this.questionnaireService.isInitialised) {

    this.questionnaireService.searchLocal(questionnaireName)
    .pipe(switchMap(item=> { 
      if (item.length > 0) {
        return this.questionnaireService.readLocal$(item[0].url);
      }
      else {
        return EMPTY;
      }      
    }))
    .subscribe(q=> {
      this.questionnaireService.setQuestionnaire(q);
      //console.log(q);      
    }); 

    }  
  }

}
