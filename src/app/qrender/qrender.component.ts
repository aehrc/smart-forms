import { Component, OnInit } from '@angular/core';

import { fhirclient } from 'fhirclient/lib/types';
import { FHIRService } from '../services/fhir.service';
import { PatientService } from '../services/patient.service';

@Component({
  selector: 'app-qrender',
  templateUrl: './qrender.component.html',
  styleUrls: ['./qrender.component.css']
})
export class QRenderComponent implements OnInit {

  public patient: fhirclient.FHIR.Patient = null;

  constructor(private patientService: PatientService, private fhirService: FHIRService ) { }

  ngOnInit(): void {
    //if (this.fhir.isAuthorizing()) {
    var client = this.fhirService.getClient();
    if (!client) {  

      this.fhirService.authorizeReady()
      .then(fhirService => { 
        client = fhirService.getClient()
        console.log("FHIR alient authorized"); 
        console.log(client);

        this.patientService.getPatient()
        .then(patient => { 
          console.log("getPatient fulfilled");
          console.log(patient);
          this.patient = patient;
        })
        .catch( reason => console.log("getPatient rejected: " + reason));
  
      })
      .catch( reason => console.log("FHIRService.authorizeReady() rejected: " + reason));
    }    
    else {
    //  var client = this.fhir.getClient();
    //  if (client) {
        console.log("FHIR client Initialised");
        console.log(client);

        this.patientService.getPatient()
        .then(patient => { 
          console.log("getPatient fulfilled");
          console.log(patient);
          this.patient = patient;
        })
        .catch( reason => console.log("getPatient rejected: " + reason));

    }
    /*  else {
        console.log("FHIR client not initialised");
      }
    }*/
  }

}
