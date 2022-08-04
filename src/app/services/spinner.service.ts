import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class SpinnerService {
  private _showSpinner = false;

  get isSpinning(): boolean {
    return this._showSpinner;
  }

  constructor() {}

  show() {
    this._showSpinner = true;
  }

  hide() {
    this._showSpinner = false;
  }
}
