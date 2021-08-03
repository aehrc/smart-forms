import { Component, OnInit, Input } from '@angular/core';
//import { fhirclient } from 'fhirclient/lib/types';
//import { Observable } from 'rxjs';
import { FHIRService } from '../fhir.service';
import * as FHIR from 'fhirclient'

@Component({
  selector: 'app-patient-banner',
  templateUrl: './patient-banner.component.html',
  styleUrls: ['./patient-banner.component.css']
})
export class PatientBannerComponent implements OnInit {

  private _patient;
  @Input() set patient(patient) {
    this._patient = patient
    this.hasLaunchContext = this.fhirService.hasLaunchContext();
  }
  get patient() {    
    return this._patient;
  }

  searchResults : Object[];

  hasLaunchContext = false;

  constructor(private fhirService: FHIRService) { }

  ngOnInit(): void {    
  }

  private getPatientName(currentPatient: any) { //fhirclient.FHIR.Patient) {
    return this.fhirService.getPatientName(currentPatient);
  }

  setShowPatientResults() {
    console.log("setShowPatientResults");
  }

  loadPatient(selectedPatient) {
    var patient = this.fhirService.setCurrentPatient(selectedPatient.resource);

    if (patient)
      this.patient = patient;

    this.searchResults = null;
  }

  searchPatient(criteria: string) {
    var self = this;

    if (criteria.length > 1) {
      this.fhirService.searchPatientByName(criteria)
      .then(function(response) {
          self.searchResults = response;
          console.log(response);
      })
      .catch(reason => { 
        console.log(reason);
        this.searchResults = [];
      });
    }
    else 
        this.searchResults = [];
  }
}
