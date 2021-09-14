import { Component } from "@angular/core";
import { ControlValueAccessor, FormArray, FormControl, NG_VALUE_ACCESSOR } from "@angular/forms";
import { fhirclient } from "fhirclient/lib/types";
import { Observable } from "rxjs";
import { QuestionnaireFormItem } from "../services/questionnaire-response.model";
import { QuestionnaireResponseService } from "../services/questionnaire-response.service";
import { AnswerOption } from "../services/questionnaire.model";
import { ValueSetFactory, ValueSetService } from "../services/value-set.service";
import { QuestionnaireItemBase } from "./questionnaire-item-base.component";

type ItemControl = 'autocomplete' | 'drop-down' | 'check-box' | 'radio-button'

@Component({
    selector: 'qitem-choice',
    templateUrl: './questionnaire-item-choice.component.html',
    styleUrls: ['./questionnaire-item.component.css'],
    providers: [{
      provide: NG_VALUE_ACCESSOR,
      useExisting: QuestionnaireItemChoiceComponent,
      multi: true
  }]
})
export class QuestionnaireItemChoiceComponent extends QuestionnaireItemBase implements ControlValueAccessor {
  
    readonly droplistOptionsCount = 3;
  
    // select FormControl
    formControl = new FormControl();

    // component FormControl
    private qformControl: QuestionnaireFormItem = new QuestionnaireFormItem();
  
    checkboxes: FormArray =  new FormArray([]);
  
    

    itemControl: ItemControl;
    isHorizontal: boolean = true;  

    answerOption?: AnswerOption[];

    onChange;   // onChange callback
    onTouched; // onChange callback
  
    constructor(qresponseService: QuestionnaireResponseService, private valueSetFactory: ValueSetFactory ) {
      super(qresponseService);
    }
    
  
    onInit() {
      this.qformControl.item = this.item;


      if (this.item.answerOption?.length > 0 && this.item.answerOption?.length <= this.droplistOptionsCount) 
        this.itemControl = "check-box";
      else {
        this.itemControl = "drop-down";
      }
      
      var itemControl = this.item.extension?.find(e=> e.url == "http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl");
      if (itemControl && itemControl.valueCodeableConcept?.coding.length > 0) {
        this.itemControl = itemControl.valueCodeableConcept?.coding[0].code;
      }
    
      if (this.item.answerOption) {
        this.answerOption = this.item.answerOption;
      }
      else {
        this.answerOption = [];

        if (this.item.answerValueSet) {
          var answerValueSet$ = this.valueSetFactory.expand(this.item.answerValueSet);

          answerValueSet$.subscribe(vs => {
            console.log(vs.name, vs.url, vs.expansion?.contains);

            vs.expansion?.contains.forEach(c => {
              this.answerOption.push({ "valueCoding": { "system": c.system, "code": c.code, "display": c.display } } as AnswerOption);
            });

            if (this.answerOption?.length > 0) {
              if (this.itemControl == "check-box") { //ItemControl["check-box"]) {
                this.answerOption.forEach(o=> this.checkboxes.push(new FormControl()));
                this.qformControl.valueChanges.subscribe(newValue => this.valueChanged(newValue));
              }    
              else {  // drop-down
                this.formControl.valueChanges.subscribe(newValue => this.selectChanged(newValue));
              }        
            }
          });
        }
      }

      if (this.parentGroup) {
        this.qformControl = this.parentGroup.controls[this.item.linkId] as QuestionnaireFormItem;
      }
      else if (this.repeat) {
        this.qformControl = this.repeat as QuestionnaireFormItem;
      }

      if (this.answerOption?.length > 0) {
        if (this.itemControl == "check-box") { 
          this.answerOption.forEach(o=> this.checkboxes.push(new FormControl()));
          this.qformControl.valueChanges.subscribe(newValue => this.valueChanged(newValue));
        }
        else {
          this.formControl.valueChanges.subscribe(newValue => this.selectChanged(newValue));
        }
      }

      var choiceOrentiation = this.item.extension?.find(e=> e.url == "http://hl7.org/fhir/StructureDefinition/questionnaire-choiceOrientation");
      switch (choiceOrentiation?.valueCode) {
        case "vertical": 
          this.isHorizontal = false;
          break;
        case "horizontal": 
          this.isHorizontal = true;
          break;
      }    
    }
  
    private setValueCoding(newCode) {
      var newAnswer = this.answerOption.find(o => o.valueCoding.code == newCode);
      if (newAnswer) {
            this.qformControl.setValue(newAnswer.valueCoding);
      }
      else {
        this.qformControl.setValue(null);
      }
    }

    selectChanged(newValue) {
      this.setValueCoding(newValue);
    }

    valueChanged(newValue) {
      var newCoding = newValue as fhirclient.FHIR.Coding;
      var newCode: string;
      if (newCoding.code) {
        newCode = newCoding.code;
      }
      else {
        newCode = newValue;
      }

      for (let index = 0; index < this.answerOption.length; index++) {
        const option = this.answerOption[index];
        if (option.valueCoding.code == newCode) { 
          this.checkboxes.controls[index].setValue(true);
          break;
        }
      } 
    }

    onCheckboxChange(event, index) {
      if (event.target.checked) {
          this.setValueCoding(event.target.value);
          var i = 0;
          this.checkboxes.controls.forEach(element => { 
            if (i++ != index)
              (element as FormControl).setValue(null);
          });
      }
      else {
        this.qformControl.setValue(null);
      }
    }
    
    writeValue(value) {
      if (this.qformControl && value) {
        this.qformControl.setValue(value);
      }
    }

  registerOnChange(fn) { this.onChange = fn;  }

  registerOnTouched(fn) { this.onTouched = fn; }

}