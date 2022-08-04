import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import * as FHIR from "fhirclient";
import { fhirclient } from "fhirclient/lib/types";
import { FHIRService } from "../services/fhir.service";

@Component({
  selector: "app-redirect",
  templateUrl: "./redirect.component.html",
  styleUrls: ["./redirect.component.css"],
})
export class RedirectComponent implements OnInit {
  constructor(private fhir: FHIRService, private router: Router) {}

  ngOnInit() {
    this.fhir
      .authorizeReady()
      .then((fhirclient) => {
        console.log(fhirclient.getClient());
        this.router.navigate(["/"]);
      })
      .catch((reason) =>
        console.log("FHIRService.authorizeReady() rejected: " + reason)
      );
  }
}
