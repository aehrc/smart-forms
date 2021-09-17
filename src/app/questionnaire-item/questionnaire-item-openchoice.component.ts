import { Component } from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from "@angular/forms";
import { EMPTY, Observable, of } from "rxjs";
import { debounceTime, distinctUntilChanged, switchMap, tap } from "rxjs/operators";
import { QuestionnaireFormItem } from "../services/questionnaire-response.model";
import { QuestionnaireResponseService } from "../services/questionnaire-response.service";
import { AnswerOption } from "../services/questionnaire.model";
import { ValueSet } from "../services/value-set.model";
import { ValueSetService } from "../services/value-set.service";
import { QuestionnaireItemBase } from "./questionnaire-item-base.component";
import { fhirclient } from "fhirclient/lib/types";

@Component({
    selector: 'qitem-openchoice',
    templateUrl: './questionnaire-item-openchoice.component.html',
    styleUrls: ['./questionnaire-item.component.css'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: QuestionnaireItemOpenChoiceComponent,
        multi: true
    }]
})
export class QuestionnaireItemOpenChoiceComponent extends QuestionnaireItemBase implements ControlValueAccessor {
    // inner FormControl
    formControl: FormControl = new FormControl();

    selectOptions? : AnswerOption[];

    onChange;   // onChange callback
    onTouched; // onChange callback

    // component FormControl
    private qformControl: QuestionnaireFormItem = new QuestionnaireFormItem();

    constructor(qresponseService: QuestionnaireResponseService ) {
        super(qresponseService);
    }
  
    onInit() {
        if (this.parentGroup)
            this.qformControl = this.parentGroup.controls[this.item.linkId] as QuestionnaireFormItem;
        else if (this.repeat)
            this.qformControl = this.repeat as QuestionnaireFormItem;

        this.qformControl.valueChanges.subscribe(newValue => this.valueChanged(newValue));
        
        if (this.qformControl.value) {
            var coding = this.qformControl.value as fhirclient.FHIR.Coding;
            if (coding.code) { // valueCoding
                this.formControl.setValue(coding.display);
            }
            else {  // valueString
                this.formControl.setValue(this.qformControl.value);
            }
        }
  
        this.formControl.valueChanges
        .pipe(tap(res => {                
            this.qformControl.setValue(res);
            if (this.onChange)
                this.onChange(res);    
            }), 
            debounceTime(300), 
            distinctUntilChanged(), 
            switchMap(newValue => { 
                if (this.item.answerOption)
                    return this.filterOptions(newValue); 
                else if (this.item.answerValueSet) {
                    var fullUrl = this.item.answerValueSet + "filter=" + newValue + "&count=10";// + "&includeDesignations=true";
                    return ValueSetService.expand(fullUrl);
                }
                else
                    return EMPTY;
            }))
        .subscribe(res => {
            var valueSet = res as ValueSet;
            if (valueSet.resourceType) {
                var options : AnswerOption[] = [];
                valueSet.expansion?.contains.forEach(c => {
                    options.push({ "valueCoding": { "system": c.system, "code": c.code, "display": c.display } } as AnswerOption);
                });
                this.selectOptions = options;
            }
            else
                this.selectOptions = res as AnswerOption[];
        });
        
    }

    onFocusOut() {
        setTimeout(() => {
            this.selectOptions = null;
          }, 300);   
          
        if (this.onTouched)
            this.onTouched();
    }

    filterOptions(criteria: string) : Observable<AnswerOption[]> {
        return of(this.item.answerOption?.filter(option => option.valueCoding.display.toLocaleLowerCase().includes(criteria.toLocaleLowerCase())));
    }

    selectOption(option: AnswerOption) {
        console.log("selectOption", option);

        this.formControl.setValue(option.valueCoding.display, { emitEvent: false });
        this.qformControl.setValue(option.valueCoding);

        if (this.onChange)
            this.onChange(option.valueCoding);

        this.selectOptions = null;
    }

    valueChanged(newValue) {
        var newCoding = newValue as fhirclient.FHIR.Coding;

        if (newCoding.code) {
            this.formControl.setValue(newCoding.display, { emitEvent: false });
        }
        else {
          this.formControl.setValue(newValue, { emitEvent: false });
        }
    }

    writeValue(value) {
        this.qformControl.setValue(value);
    }

    registerOnChange(fn) { this.onChange = fn;  }

    registerOnTouched(fn) { this.onTouched = fn; }
}
  
  