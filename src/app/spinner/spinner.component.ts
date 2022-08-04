// https://christianlydemann.com/four-ways-to-create-loading-spinners-in-an-angular-app/

import { Component, OnInit, Input } from "@angular/core";
import { SpinnerService } from "../services/spinner.service";

@Component({
  selector: "app-spinner",
  templateUrl: "./spinner.component.html",
  styleUrls: ["./spinner.component.css"],
})
export class SpinnerComponent implements OnInit {
  @Input() message = "";

  get visible(): boolean {
    return this.spinnerService.isSpinning;
  }

  constructor(private spinnerService: SpinnerService) {}

  ngOnInit(): void {}
}
