import { Component, OnDestroy } from "@angular/core";
import { ControlValueAccessor, FormArray, FormControl, NG_VALUE_ACCESSOR } from "@angular/forms";
import { fhirclient } from "fhirclient/lib/types";
import { Observable, of, OperatorFunction, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged, map, switchMap } from "rxjs/operators";
import { QuestionnaireFormItem } from "../services/questionnaire-form-item.model";
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
export class QuestionnaireItemChoiceComponent extends QuestionnaireItemBase implements ControlValueAccessor, OnDestroy {
  
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
    
    private subscriptions: Subscription[] = [];

    private addSubscriptions(...subs: Subscription[]) {
      this.subscriptions.push(...subs);
    }
  
    ngOnDestroy() {
      for (const subscription of this.subscriptions) {
        subscription.unsubscribe();
      }
    }

    onInit() {
      //this.qformControl.item = this.item;

      if (this.parentGroup) {
        this.qformControl = this.parentGroup.controls[this.item.linkId] as QuestionnaireFormItem;
        if (this.qformControl === undefined) 
          throw new Error("linkId '" + this.item.linkId + "' not found in parentGroup controls. Ensure linkId element exists in '" + this.parentGroup.item.text + "'.");
      }
      else if (this.repeat) {
        this.qformControl = this.repeat as QuestionnaireFormItem;
      }

      this.addSubscriptions(this.qformControl.valueChanges.subscribe(newValue => 
        this.valueChanged(newValue)));

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
      else if (this.itemControl !== "autocomplete") {
        this.answerOption = [];

        if (this.item.answerValueSet) {
          var answerValueSet$ = this.valueSetFactory.expand(this.item.answerValueSet);

          this.addSubscriptions(answerValueSet$.subscribe(vs => {
            console.log(vs.name, vs.url, vs.expansion?.contains);

            vs.expansion?.contains.forEach(c => {
              this.answerOption.push({ "valueCoding": { "system": c.system, "code": c.code, "display": c.display } } as AnswerOption);
            });

            if (this.answerOption?.length > 0) {
              if (this.itemControl == "check-box") { 
                this.answerOption.forEach(o=> this.checkboxes.push(new FormControl()));
                //this.qformControl.valueChanges.subscribe(newValue => this.valueChanged(newValue));
              }    
              else {  // drop-down
                if (this.qformControl.value) {
                  this.formControl.setValue(this.qformControl.value);
                }
                this.addSubscriptions(this.formControl.valueChanges.subscribe(newValue => 
                  this.selectChanged(newValue)));
              }        
            }
          }));
        }
      }
      else if (this.item.answerValueSet) {  // autocomplete
        if (this.qformControl.value) {
          this.formControl.setValue(this.qformControl.value);
        }
        this.addSubscriptions(this.formControl.valueChanges.subscribe(newValue => 
          this.selectChanged(newValue)));
      }

      if (this.answerOption?.length > 0) {
        if (this.itemControl == "check-box") { 
          this.answerOption.forEach(o=> this.checkboxes.push(new FormControl()));
          //this.qformControl.valueChanges.subscribe(newValue => this.valueChanged(newValue));
        }
        else {
          if (this.qformControl.value) {
            this.formControl.setValue(this.qformControl.value);
          }
          this.addSubscriptions(this.formControl.valueChanges.subscribe(newValue => 
            this.selectChanged(newValue)));
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
      
    // uses https://ng-bootstrap.github.io/#/components/typeahead/examples
    search: OperatorFunction<string, readonly fhirclient.FHIR.Coding[]> = (text$: Observable<string>) => {
      var maxlist = 10;

      return text$.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        switchMap(term => {
          if (term.length < 2) {
            return of([]); 
          }
          else { 
            if (this.item.answerValueSet) {
              var fullUrl = this.item.answerValueSet + "filter=" + term + "&count=" + maxlist; // + "&includeDesignations=true";
              return ValueSetService.expand(fullUrl)
              .pipe(map(vs=> {
                var coding : fhirclient.FHIR.Coding[] = [];
                vs.expansion?.contains?.forEach(c => {
                  coding.push({ "system": c.system, "code": c.code, "display": c.display } as fhirclient.FHIR.Coding);                  
                });
                return coding;
              }));
            }
            else if (this.answerOption) {
              return this.filterOptionsCoding(term, maxlist);
            }
            else {
              return of([]); 
            }
          }
        })
      )    
    }

    formatter = (coding: fhirclient.FHIR.Coding) => coding.display;

    private filterOptionsCoding(criteria: string, maxlist: number) : Observable<fhirclient.FHIR.Coding[]> {
      return of(this.answerOption?.filter(option => option.valueCoding.display.toLocaleLowerCase().includes(criteria.toLocaleLowerCase()))
        .slice(0, maxlist)
        .map(o=> o.valueCoding));
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
      if (newValue === undefined) {
        this.qformControl.setValue(null);
      } else {     
        var newCoding = newValue as fhirclient.FHIR.Coding;
        if (newCoding.code) { 
          if (newCoding.code != this.qformControl.value?.code) {          
            this.qformControl.setValue(newCoding);
          }
        } 
        else {  // code
          if (newValue !== this.qformControl.value) {          
            this.setValueCoding(newValue);
          }
        }
      }
    }

    valueChanged(newValue) {
      var newCoding = newValue as fhirclient.FHIR.Coding;
      var newCode: string;
      if (newCoding?.code) {
        newCode = newCoding.code;
      }
      else {
        newCode = newValue;
      }

      if (this.itemControl == "check-box") {
      for (let index = 0; index < this.answerOption.length; index++) {
        const option = this.answerOption[index];
        if (option.valueCoding.code == newCode) { 
          this.checkboxes.controls[index].setValue(true);
          break;
        }
      } 
      }
      else if (this.itemControl == "autocomplete"){
        this.formControl.setValue(newCoding);
      }
      else {
        if (this.formControl.value !== newCode)
          this.formControl.setValue(newCode);
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