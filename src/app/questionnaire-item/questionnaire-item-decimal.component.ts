import { AfterViewInit, Component, Injector } from "@angular/core";
import {
  ControlValueAccessor,
  FormControl,
  NgControl,
  NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { QuestionnaireFormItem } from "../services/questionnaire-form-item.model";
import { QuestionnaireForm } from "../services/questionnaire-form.model";
import { QuestionnaireResponseService } from "../services/questionnaire-response.service";
import { QuestionnaireItemBase } from "./questionnaire-item-base.component";

@Component({
  selector: "qitem-decimal",
  templateUrl: "./questionnaire-item-decimal.component.html",
  styleUrls: ["./questionnaire-item.component.css"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: QuestionnaireItemDecimalComponent,
      multi: true,
    },
  ],
})
export class QuestionnaireItemDecimalComponent
  extends QuestionnaireItemBase
  implements ControlValueAccessor, AfterViewInit
{
  //@Output()
  private valueChange; //= new EventEmitter();
  value;

  constructor(
    qresponseService: QuestionnaireResponseService,
    private injector: Injector
  ) {
    super(qresponseService);
  }

  ngAfterViewInit(): void {
    //throw new Error('Method not implemented.');
  }

  private formControl: QuestionnaireFormItem; // = new FormControl();

  onInit() {
    /*      if (this.parentGroup)
        this.formControl = this.parentGroup.controls[this.item.linkId] as FormControl;
*/

    const ngControl: NgControl = this.injector.get(NgControl, null);
    if (ngControl) {
      this.formControl = ngControl.control as QuestionnaireFormItem;

      if (this.formControl.item?.extension) {
        const calculatedExpression = this.item.extension.find(
          (e) =>
            e.url ===
            "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression"
        )?.valueExpression;

        if (calculatedExpression) {
          var root = this.formControl.root as QuestionnaireForm;
          root.addCalculatedExpression(
            this.formControl,
            calculatedExpression.expression
          );
        }
      }
    } else {
      // Component is missing form control binding
      console.log("Component is missing form control binding");
    }
  }

  writeValue(obj: any): void {
    this.value = obj;
    //if (obj)
  }

  registerOnChange(fn: any): void {
    this.valueChange = fn;
  }

  registerOnTouched(fn: any): void {
    // do nothing for now
  }

  setDisabledState?(isDisabled: boolean): void {
    //throw new Error('Method not implemented.');
  }

  onChangeEvent(event: any) {
    console.log(event.target.value);

    this.valueChange(event.target.value);
  }
}
