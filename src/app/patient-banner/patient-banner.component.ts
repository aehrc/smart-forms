import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { EMPTY, Observable } from 'rxjs';
import { catchError, debounceTime, switchMap } from 'rxjs/operators';
import { FHIRService } from '../services/fhir.service';

import { PatientService } from '../services/patient.service';
//import * as FHIR from 'fhirclient'

@Component({
  selector: 'app-patient-banner',
  templateUrl: './patient-banner.component.html',
  styleUrls: ['./patient-banner.component.css']
})
export class PatientBannerComponent implements OnInit {

  private _patient;

  @Input() set patient(patient) {
    this._patient = patient
    //this.hasLaunchContext = this.fhirService.hasLaunchContext();
  }

  get patient() {    
    return this._patient;
  }

  searchResults : Object[];

  hasLaunchContext = false;

  // patient search criteria
  searchCriteria = new FormControl('');

  constructor(private patientService: PatientService, private fhirService: FHIRService) { 
    /*
    this.searchCriteria.valueChanges
      .pipe(debounceTime(50))
      .subscribe(criteria => this.searchPatient(criteria));
    */
  }

  ngOnInit(): void {    
    //var self = this;

    this.searchCriteria.valueChanges
      //.pipe(debounceTime(300))
      .pipe(switchMap(criteria => this.searchPatientAsync(criteria)))
      .subscribe(res => this.searchResults = res);
  }

  private getPatientName(currentPatient: any) { //fhirclient.FHIR.Patient) {
    return this.patientService.getPatientName(currentPatient);
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

  searchPatientAsync(criteria: string) : Observable<Object[]> {
    var self = this;

    if (criteria.length > 1) {
      console.log("Searching: " + criteria)
      return this.patientService.searchPatient(criteria)
      .pipe(catchError(err => { 
          console.log("Search error: " + err); 
          return EMPTY;
        })
      );
    }
    else {
      console.log("Not enough search criteria to initaite search: " + criteria.length); 
      return EMPTY;
    }
  }

}
