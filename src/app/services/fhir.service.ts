import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';


import * as FHIR from 'fhirclient';
import Client from 'fhirclient/lib/Client';
import { fhirclient } from 'fhirclient/lib/types';

//import * as fhirSettings from 'fhirclient/lib/settings';

//export fhirTypes;

//(window as any).FHIR = FHIR;
//(window as any).fhirSettings = fhirSettings;
//(window as any).fhirTypes = fhirclient;

import { SMART_KEY } from "fhirclient/lib/settings";
//import { fhirclient } from "./types";
//export { SMART_KEY as KEY };
//export { fhirclient as fhirTypes };

export interface Parameters extends fhirclient.FHIR.Resource {
  resourceType: "Parameters";
  parameter: {
    name: string;
    valueReference?: fhirclient.FHIR.Reference;
    resource?: fhirclient.FHIR.Resource;  
  } [];    
}

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

    // Calling the SMART JS Client ready method to initialize the SMART Client
    //FHIR.oauth2.ready(this.oauth2ReadyCallback, this.oauth2ReadyErrback);
  }

  /*
  oauth2ReadyErrback = (error: any) => {
    console.error(error);
  }
  */

  //private promise: Promise<FHIRService>;

  /**
   * Callback method once the SMART client has been initialized after the OAuth2.0 token workflow.
   */
  /*
  oauth2ReadyCallback = (client: Client) => { //FHIR.SMART.SMARTClient) => {
    this.fhirClient = client;
  }
  */

  public getClient() : Client {
    return this.fhirClient;
  }

  public logout() {
    sessionStorage.clear();
    this.fhirClient = null;
    //this.loggedIn.next(false);
    //this._router.navigate(['/index']);
  }

    /**
   * Method called to check if there is an active user logged in to the application.
   * @returns {Observable<boolean>} Subscribers get notified when the state changes.
   */
  get isLoggedIn() : boolean {
    var hasTokenResponse = false;
        
    if (sessionStorage.getItem(SMART_KEY)) { // 'SMART_KEY')) {
      hasTokenResponse = true;
      //this.loggedIn.next(true);
    } else {
      //this.loggedIn.next(false);

      for(var i = 0; i< sessionStorage.length;i++) {
        var key = sessionStorage.key(i);
        console.log(key +": " + sessionStorage.getItem(key));
      }
    }
    //return this.loggedIn.asObservable();
    return hasTokenResponse
  }
  
  /**
   *  Build a FHIR search query and returns an Observable of type FHIR.Resource (normally a Bundle, but could be an OperationOutcome??).
   * @param searchConfig an object with the following sub-keys for configuring the search.
   *  type: (required) the Resource type to search for
   *  query: An object of key/value pairs for the query part of the URL to be constructed.
   *  headers: An object containing HTTP headers to be added to the request.
   */
  search(searchConfig): Observable<fhirclient.FHIR.Resource> {
    var searchParams = new URLSearchParams();
    if (searchConfig.query) {
      var queryVars = searchConfig.query;
      var queryVarKeys = Object.keys(queryVars);

      for (var i=0, len=queryVarKeys.length; i<len; ++i) {
        var key = queryVarKeys[i];
        searchParams.append(key, queryVars[key]);
      }
    }

    let result = this.fhirClient.request({
      url: searchConfig.type + '?' + searchParams,
      headers: searchConfig.headers
    });

    return from(result);
  }

  hasLaunchContext(): boolean {
    var fhirClient = this.fhirClient;

    return (fhirClient != null && fhirClient.patient != null && fhirClient.patient.id != null);
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
  
  batch(bundle): Observable<fhirclient.FHIR.Resource> {
    var headers = {
      "Cache-Control": "no-cache", 
      "Content-Type": "application/json+fhir; charset=UTF-8"};

    let result = this.fhirClient.request({
      url: "",
      method: "POST",
      body: JSON.stringify(bundle),
      headers: headers
    });

    return from(result);
  }

  execute(operation, parameters): Observable<fhirclient.FHIR.Resource> {
    var headers = {
      "Cache-Control": "no-cache", 
      "Content-Type": "application/json+fhir; charset=UTF-8",
      "Accept": "application/json+fhir; charset=utf-8"
    };

    let result = this.fhirClient.request({
      url: operation,
      method: "POST",
      body: JSON.stringify(parameters),
      headers: headers
    });
    return from(result);
  }

  create(resource): Observable<fhirclient.FHIR.Resource> {
    let result = this.fhirClient.create(resource);

    return from(result);
  };

  read(resourceType, id): Observable<fhirclient.FHIR.Resource> {
    var headers = {'Cache-Control': 'no-cache'};

    let result = this.fhirClient.request({
      url: resourceType + '/' + id,
      headers: headers
    });

    return from(result);
  }

}
