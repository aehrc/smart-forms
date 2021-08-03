import { Injectable } from '@angular/core';

import * as FHIR from 'fhirclient';
import Client from 'fhirclient/lib/Client';
import { fhirclient } from 'fhirclient/lib/types';

import { SMART_KEY } from "fhirclient/lib/settings";

@Injectable({
  providedIn: 'root'
})
export class FHIRService {

  private fhirClient: Client; 

  private _isAuthorizing: boolean 

  constructor() { 
    this.fhirClient = null;

    this._isAuthorizing = false;
  }


  /** 
   * Initiate the Authorization flow with the clientId, scope and optional redirectUri 
   */
  public authorize(clientId: string, scope: string, redirectUri?: string) : void {
    
    this._isAuthorizing = true;

    FHIR.oauth2.authorize({
      "client_id": clientId,
      "scope": scope, 
      "redirect_uri": redirectUri
    });

  }

  public isAuthorizing(): boolean {
    return this._isAuthorizing;
  }

  /** 
   * Authorization flow ready to completed after being returned to redirect page
   * Returns Promise containing this object 
   */
  public authorizeReady(): Promise<FHIRService> {    
    console.log("isLoggedIn: " + this.isLoggedIn);

    var fhirService = this;

    var promise = new Promise<FHIRService>(function(resolve, reject) {

      FHIR.oauth2.ready()
      .then(
        client => { 
          fhirService.fhirClient = client; 

          resolve(fhirService);
        }
      )
      /*.then( reason => {
        console.log("oath2.ready() onrejected: " + reason);
        //reject(reason);
      })*/
      .catch(reason => { 
        console.error(reason);
        reject(reason);
      });

    });

    this._isAuthorizing = false;

    return promise;
  }

  public getClient() : Client {
    return this.fhirClient;
  }

  public logout() {
    sessionStorage.clear();
    this.fhirClient = null;
  }

    /**
   * Method called to check if there is an active user logged in to the application.
   * @returns {Observable<boolean>} Subscribers get notified when the state changes.
   */
  get isLoggedIn() : boolean {
    var hasTokenResponse = false;
        
    if (sessionStorage.getItem(SMART_KEY)) { // 'SMART_KEY')) {
      hasTokenResponse = true;
      //this.loggedIn.next(false);

      for(var i = 0; i< sessionStorage.length;i++) {
        var key = sessionStorage.key(i);
        console.log(key +": " + sessionStorage.getItem(key));
      }
    }
    return hasTokenResponse
  }
  
  public getPatient() :Promise<fhirclient.FHIR.Patient> {

    if (this.fhirClient) {
      var result = this.fhirClient.patient.read();
      return result;
    }

    return new Promise<fhirclient.FHIR.Patient>(function(resolve, reject) { 
      reject("FHIR client not initialised")
    }); 
  }

  /**
   * Get the patient's display name
   * @param patient optional, an FHIR Patient resource
   * @returns {string} a formatted patient name
   * @private
   */
  getPatientName = function (patient) {
    var currentPatient = patient;

    var name = "";
    if (currentPatient && currentPatient.name && currentPatient.name.length > 0) {
      if (currentPatient.name[0].given && currentPatient.name[0].family) {
        name = currentPatient.name[0].given[0] + " " + currentPatient.name[0].family;
      }
      else if (currentPatient.name[0].family) {
        name = currentPatient.name[0].family;
      }
      else if (currentPatient.name[0].given ) {
        name = currentPatient.name[0].given[0]
      }
    }
    return name;
  };

  /**
   * Search patients by name
   * @param searchText the search text for patient names
   * @returns {*}
   */
  searchPatientByName(searchText: string) : Promise<Object[]> {
    var self = this;

    return new Promise<Object[]> (
      function(resolve, reject) {

        self.fhirSearch({
          type: "Patient",
          query: {name: searchText},
          headers: {'Cache-Control': 'no-cache'}
        })
        .then(
          function(response) {
            // process data for md-autocomplete
            var patientList = [];
            if (response && response.entry) {
              for (var i=0, iLen=response.entry.length; i<iLen; i++) {
                var patient = response.entry[i].resource;
                patientList.push({
                  name: self.getPatientName(patient),
                  gender: patient.gender,
                  dob: patient.birthDate,
                  //phone: this.getPatientPhoneNumber(patient),
                  id: patient.id,
                  resource: patient
                })
              }
            }

            resolve(patientList);
          }, 
          function( error) {
            console.log(error);
            reject(error);
          }
        );
      }
    );
  };

  /**
   *  Build a FHIR search query and returns a promise with the result.
   * @param searchConfig an object with the following sub-keys for configuring the search.
   *  type: (required) the Resource type to search for
   *  query: An object of key/value pairs for the query part of the URL to be constructed.
   *  headers: An object containing HTTP headers to be added to the request.
   */
  fhirSearch(searchConfig) {
    var searchParams = new URLSearchParams();
    if (searchConfig.query) {
      var queryVars = searchConfig.query;
      var queryVarKeys = Object.keys(queryVars);

      for (var i=0, len=queryVarKeys.length; i<len; ++i) {
        var key = queryVarKeys[i];
        searchParams.append(key, queryVars[key]);
      }
    }

    return this.fhirClient.request({
      url: searchConfig.type + '?' + searchParams,
      headers: searchConfig.headers
    });
  }

  /**
   * Set the current selected patient
   * Data returned through an angular broadcast event.
   * @param patient the selected patient
   */
  setCurrentPatient(patient: fhirclient.FHIR.Patient): fhirclient.FHIR.Patient {
    if (!this.hasLaunchContext())
    {
      var baseUrl = this.fhirClient.state.serverUrl;
      this.fhirClient = FHIR.client({serverUrl: baseUrl, tokenResponse: { patient: patient.id }});

      return patient;
    }
    else {
      // ignore since the current patient was loaded from a launch
      return null;
    }
  };

  hasLaunchContext(): boolean {
    var fhirClient = this.fhirClient;

    return (fhirClient != null && fhirClient.patient != null && fhirClient.patient.id != null);
  }
}
