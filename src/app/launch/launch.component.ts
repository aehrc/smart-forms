import { Component, OnInit } from '@angular/core';

import * as FHIR from 'fhirclient'

@Component({
  selector: 'app-launch',
  templateUrl: './launch.component.html',
  styleUrls: ['./launch.component.css']
})
export class LaunchComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    FHIR.oauth2.ready()
    .then(client => client.request("Patient"))
    .then(console.log)
    .catch(console.error);
  }

}
