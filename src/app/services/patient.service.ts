import { Injectable } from "@angular/core";
import { Observable, Subject, ReplaySubject, from, Subscription } from "rxjs";
import { map } from "rxjs/operators";

import Client from "fhirclient/lib/Client";
import { fhirclient } from "fhirclient/lib/types";

import { FHIRService } from "./fhir.service";

export interface PatientItem {
  name: string;
  gender: string;
  dob: fhirclient.FHIR.dateTime;
  id: fhirclient.FHIR.id;
  resource: fhirclient.FHIR.Patient;
}

@Injectable({
  providedIn: "root",
})
export class PatientService {
  private patientSubject: Subject<fhirclient.FHIR.Patient>;

  constructor(private fhirService: FHIRService) {}

  private get fhirClient(): Client {
    return this.fhirService.getClient();
  }

  get hasLaunchContext(): boolean {
    return this.fhirService.isLoggedIn;
  }

  get patient$(): Observable<fhirclient.FHIR.Patient> {
    if (!this.patientSubject) this.getPatient();

    return this.patientSubject.asObservable();
  }

  private patientSubscription: Subscription;

  getPatient(): Promise<fhirclient.FHIR.Patient> {
    if (this.fhirClient) {
      var result = this.fhirClient.patient.read();

      if (!this.patientSubject)
        this.patientSubject = new ReplaySubject<fhirclient.FHIR.Patient>(1);

      if (this.patientSubscription !== undefined)
        this.patientSubscription.unsubscribe();

      this.patientSubscription = from(result).subscribe((p) =>
        this.patientSubject.next(p)
      );

      return result;
    }

    return new Promise<fhirclient.FHIR.Patient>(function (resolve, reject) {
      reject("FHIR client not initialised");
    });
  }

  setPatient(patient: fhirclient.FHIR.Patient) {
    var patientContext = this.fhirService.setCurrentPatient(patient);

    if (!this.patientSubject)
      this.patientSubject = new ReplaySubject<fhirclient.FHIR.Patient>(1);

    if (patientContext) this.patientSubject.next(patientContext);
  }

  /**
   * Get the patient's display name
   * @param patient optional, an FHIR Patient resource
   * @returns {string} a formatted patient name
   * @private
   */
  getPatientName(patient) {
    var currentPatient = patient;

    var name = "";
    if (
      currentPatient &&
      currentPatient.name &&
      currentPatient.name.length > 0
    ) {
      if (currentPatient.name[0].given && currentPatient.name[0].family) {
        name =
          currentPatient.name[0].given[0] + " " + currentPatient.name[0].family;
      } else if (currentPatient.name[0].family) {
        name = currentPatient.name[0].family;
      } else if (currentPatient.name[0].given) {
        name = currentPatient.name[0].given[0];
      }
    }
    return name;
  }

  /**
   * Search patients by name
   * @param searchText the search text for patient names
   * @returns {*}
   */
  searchPatient(searchText: string): Observable<PatientItem[]> {
    return this.fhirService
      .search({
        type: "Patient",
        query: { name: searchText },
        headers: { "Cache-Control": "no-cache" },
      })
      .pipe(
        map((response) => {
          // process data for md-autocomplete
          var patientList: PatientItem[] = [];
          if (response && response.entry) {
            for (var i = 0; i < response.entry.length; i++) {
              var patient = response.entry[i].resource;
              patientList.push({
                name: this.getPatientName(patient),
                gender: patient.gender,
                dob: patient.birthDate,
                //phone: this.getPatientPhoneNumber(patient),
                id: patient.id,
                resource: patient,
              });
            }
          }

          return patientList;
        })
      );
  }
}
