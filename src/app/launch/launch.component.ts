import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import * as FHIR from 'fhirclient'
import { AppComponent } from '../app.component';
import { FHIRService } from '../services/fhir.service';

@Component({
  selector: 'app-launch',
  templateUrl: './launch.component.html',
  styleUrls: ['./launch.component.css']
})
export class LaunchComponent implements OnInit {

  clientId: string;
  scope: string;

  launch: string;
  iss: string;

  constructor(private route: ActivatedRoute, 
    private fhir: FHIRService, 
    private titleService:Title,
    private appComponent: AppComponent) { 

      this.clientId = "my_web_app";
      this.scope = "patient/*.read";
  }

  ngOnInit() {
    this.launch = this.route.snapshot.queryParamMap.get('launch');
    this.iss = this.route.snapshot.queryParamMap.get('iss');

    const baseUrl = window.location.origin;

    switch(this.iss) {
//      case "http://launch.smarthealthit.org/v/r4/fhir": 
//        break;

      case "https://www.demo.oridashi.com.au:8102":
        if (baseUrl.startsWith("http://localhost:4200"))
          this.clientId = "ng-qforms"
        break;
    }

    var localUrl = this.route.snapshot.queryParamMap.get('localUrl');
    var serverUrl = this.route.snapshot.queryParamMap.get('serverUrl');
    var name = this.route.snapshot.queryParamMap.get('q-name');
    
    //const redirectUri = baseUrl + "/redirect?localUrl=data/715.R4.json";
    //const redirectUri = baseUrl + "?localUrl=data/715.R4.json";
    var redirectUri: string; 
    if (localUrl) {
      redirectUri = baseUrl + "?localUrl=" + localUrl;
    }
    else
      redirectUri = baseUrl + "/";// + "?localUrl=data/715.R4.json";

    console.log('redirect_uri: ' + redirectUri);

    

    this.titleService.setTitle(this.appComponent.title + " launch - " + this.iss);

    this.fhir.authorize(this.clientId, this.scope, redirectUri);  
  }

}
