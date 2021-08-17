import { Component, OnInit } from '@angular/core';
import Client from 'fhirclient/lib/Client';

import { fhirclient } from 'fhirclient/lib/types';
import { EMPTY, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { FHIRService } from '../services/fhir.service';
import { PatientService } from '../services/patient.service';
import { Questionnaire, QuestionnaireService } from '../services/questionnaire.service';

@Component({
  selector: 'questionnaire-render',
  templateUrl: './qrender.component.html',
  styleUrls: ['./qrender.component.css']
})
export class QRenderComponent implements OnInit {

  public patient: fhirclient.FHIR.Patient = null;


  constructor(
    private patientService: PatientService, 
    private fhirService: FHIRService, 
    private questionnaireService: QuestionnaireService) { }

  ngOnInit(): void {
    var questionnaireName = "MBS715";

    //if (this.fhir.isAuthorizing()) {
    var client = this.fhirService.getClient();
    if (!client) {  

      this.fhirService.authorizeReady()
      .then(fhirService => { 
        client = fhirService.getClient()
        console.log("FHIR alient authorized"); 
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
      .catch( reason => console.log("FHIRService.authorizeReady() rejected: " + reason));
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

  private initialise(questionnaireName: string): void {
    this.patientService.getPatient()
    .then(patient => { 
      this.patient = patient;
    })
    .catch(reason => console.log("getPatient rejected: " + reason));

    this.questionnaireService.searchLocal(questionnaireName)
    .pipe(switchMap(item=> { 
      if (item.length > 0) {
        return this.questionnaireService.readLocal(item[0].url);
      }
      else {
        return EMPTY;
      }      
    }))
    .subscribe(q=> {
      this.questionnaireService.questionnaire = q;
      //console.log(q);      
    });    
  }

}
