import { Component } from "@angular/core";
import { FormArray, FormControl } from "@angular/forms";
import { Observable } from "rxjs";
import { QuestionnaireFormItem } from "../services/questionnaire-response.model";
import { QuestionnaireResponseService } from "../services/questionnaire-response.service";
import { AnswerOption } from "../services/questionnaire.model";
import { ValueSet } from "../services/value-set.model";
import { ValueSetFactory, ValueSetService } from "../services/value-set.service";
import { QuestionnaireItemBase } from "./questionnaire-item-base.component";

@Component({
    selector: 'qitem-choice',
    templateUrl: './questionnaire-item-choice.component.html',
    styleUrls: ['./questionnaire-item.component.css']
  })
  export class QuestionnaireItemChoiceComponent extends QuestionnaireItemBase  {
  
    readonly droplistOptionsCount = 6;
  
    formControl: QuestionnaireFormItem = new QuestionnaireFormItem();
  
    checkboxes: FormArray =  new FormArray([]);
  
    isHorizontal: boolean = true;  

    answerValueSet$?: Observable<ValueSet>;

    answerOption?: AnswerOption[];
  
    constructor(qresponseService: QuestionnaireResponseService, private valueSetFactory: ValueSetFactory ) {
      super(qresponseService);
    }
    
  
    onInit() {
      if (this.item.answerOption) {
        this.answerOption = this.item.answerOption;
      }
      else {
        this.answerOption = [];

        if (this.item.answerValueSet) {
          this.answerValueSet$ = this.valueSetFactory.expand(this.item.answerValueSet);

          this.answerValueSet$.subscribe(vs => {
            console.log(vs.name, vs.url, vs.expansion?.contains);

            vs.expansion?.contains.forEach(c => {
              this.answerOption.push({ "valueCoding": { "system": c.system, "code": c.code, "display": c.display } } as AnswerOption);
            });

            this.formControl.answerOption = this.answerOption;

            if (this.answerOption?.length > 0 && this.answerOption?.length <= this.droplistOptionsCount)
            {
              this.answerOption.forEach(o=> this.checkboxes.push(new FormControl()));
              this.formControl.valueChanges.subscribe(newValue => this.valueChanged(newValue));
            }      
          });
        }
      }

      if (this.parentGroup)
        this.formControl = this.parentGroup.controls[this.item.linkId] as QuestionnaireFormItem;

      this.formControl.answerOption = this.answerOption;

      if (this.answerOption?.length > 0 && this.answerOption?.length <= this.droplistOptionsCount)
      {
        this.answerOption.forEach(o=> this.checkboxes.push(new FormControl()));
        this.formControl.valueChanges.subscribe(newValue => this.valueChanged(newValue));
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
  
    valueChanged(newValue) {
      for (let index = 0; index < this.answerOption.length; index++) {
        const option = this.answerOption[index];
        if (option.valueCoding.code == newValue) { 
          this.checkboxes.controls[index].setValue(true);
          break;
        }
      } 
    }

    onCheckboxChange(event, index) {
      if (event.target.checked) {
          this.formControl.setValue(event.target.value);
          var i = 0;
          this.checkboxes.controls.forEach(element => { 
            if (i++ != index)
              (element as FormControl).setValue(null);
          });
      }
      else {
        this.formControl.setValue(null);
      }
    }
  }
  