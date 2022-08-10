import { Component } from "@angular/core";
import { QuestionnaireItemBase } from "./questionnaire-item-base.component";
import { FormControl } from "@angular/forms";

@Component({
  selector: "qitem-boolean",
  templateUrl: "./questionnaire-item-boolean.component.html",
  styleUrls: ["./questionnaire-item.component.css"],
})
export class QuestionnaireItemBooleanComponent extends QuestionnaireItemBase {
  formControl = new FormControl();

  onInit() {
    if (this.parentGroup) {
      this.formControl = this.parentGroup.controls[
        this.item.linkId
      ] as FormControl;
    }
  }
}
