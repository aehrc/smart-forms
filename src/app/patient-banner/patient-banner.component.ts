import { Component, OnInit, Input } from "@angular/core";
import { FormControl } from "@angular/forms";
import { EMPTY, Observable } from "rxjs";
import { catchError, debounceTime, switchMap } from "rxjs/operators";
import { fhirclient } from "fhirclient/lib/types";
import { PatientService } from "../services/patient.service";

@Component({
  selector: "app-patient-banner",
  templateUrl: "./patient-banner.component.html",
  styleUrls: ["./patient-banner.component.css"],
})
export class PatientBannerComponent implements OnInit {
  private _patient: fhirclient.FHIR.Patient;

  @Input() set patient(patient) {
    this._patient = patient;
    this.hasLaunchContext = this.patientService.hasLaunchContext;
  }

  get patient() {
    return this._patient;
  }

  searchResults: Object[];

  hasLaunchContext = false;

  // patient search criteria
  searchCriteria = new FormControl("");

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.searchCriteria.valueChanges
      .pipe(
        debounceTime(300),
        switchMap((criteria) => this.searchPatientAsync(criteria))
      )
      .subscribe((res) => (this.searchResults = res));
  }

  get patientName() {
    return this.patientService.getPatientName(this._patient);
  }

  get age() {
    var birthDate = new Date(this._patient.birthDate);
    var today = new Date();
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  setShowPatientResults() {
    console.log("setShowPatientResults");
  }

  loadPatient(selectedPatient) {
    var patient = selectedPatient.resource as fhirclient.FHIR.Patient;
    this.patientService.setPatient(patient);

    if (patient) this.patient = patient;

    this.searchResults = null;
  }

  searchPatientAsync(criteria: string): Observable<Object[]> {
    if (criteria.length > 1) {
      console.log("Searching: " + criteria);
      return this.patientService.searchPatient(criteria).pipe(
        catchError((err) => {
          console.log("Search error: " + err);
          return EMPTY;
        })
      );
    } else {
      console.log(
        "Not enough search criteria to initaite search: " + criteria.length
      );
      return EMPTY;
    }
  }
}
