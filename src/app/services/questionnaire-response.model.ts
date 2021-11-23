import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from "@angular/forms"
import { AnswerOption, Questionnaire, QuestionnaireItem } from "./questionnaire.model";
import { QuestionnaireResponse, QuestionnaireResponseAnswer, QuestionnaireResponseItem } from "./questionnaire-response.service";
import { Observable, ReplaySubject, Subject } from "rxjs";
import { fhirclient } from 'fhirclient/lib/types';
import { parse } from "path";

export class QuestionnaireForm extends FormGroup { 
    private _questionnaire: Questionnaire;
    get questionnaire() : Questionnaire {
        return this._questionnaire;    
    };

    private _response: QuestionnaireResponse;
    get response() : QuestionnaireResponse {
        return this._response;    
    };

    private patient: fhirclient.FHIR.Patient

    constructor(questionnaire: Questionnaire, patient$: Observable<fhirclient.FHIR.Patient>) {
        super(QuestionnaireForm.createControls(questionnaire));

        patient$.subscribe(p=> { this.patient = p });

        this._questionnaire = questionnaire;

        this.valueChanges.subscribe(selectedValue => this.OnValueChanges(selectedValue));
        
        this.OnValueChanges(null);
    }

    private OnValueChanges(selectedValue: any) {
        var items: QuestionnaireResponseItem[] = [];          

        this._questionnaire.item.forEach(item  => {
            var model = this.controls[item.linkId] as QuestionnaireFormItem; // this may also be QuestionnaireFormGroup or QuestionnaireFormArray
            if (model) {
              var itemData = model.response;
              if (itemData != null)
                  items.push(itemData);
            }
            else {
              console.log("model for control not found: " + item.linkId);
            }
          });
      
        this.questionnaireResponse = { 
            "resourceType": "QuestionnaireResponse",
            "questionnaire": "Questionnaire/" + this._questionnaire.id,
            "status": "in-progress",
            "subject": { "reference": this.patient ? "patient/" + this.patient.id : null },
            "authored": new Date().toISOString(),
            "author": null,
            "item": items
          };          
    }

    private questionnaireResponseSubject: Subject<QuestionnaireResponse> = new ReplaySubject<QuestionnaireResponse>(1);

    private set questionnaireResponse(questionnaireResponse: QuestionnaireResponse) {
      this.questionnaireResponseSubject.next(questionnaireResponse);
    }
  
    get questionnaireResponse$(): Observable<QuestionnaireResponse> {
      return this.questionnaireResponseSubject.asObservable();
    }   

    private static createControls(questionnaire: Questionnaire) : { [key: string]: AbstractControl; }
    {
      var controls: { [key: string]: AbstractControl; } = {};
  
      questionnaire.item.forEach(item => {  
        if (item.repeats)
          controls[item.linkId] = new QuestionnaireFormArray(item);
        else {
          switch (item.type) {
            case "group": 
              controls[item.linkId] = new QuestionnaireFormGroup(item);
              break;
            default:
              controls[item.linkId] =  new QuestionnaireFormItem(item);
          }
        }
      });
  
      return controls;
    }
      

    merge(qResponse: QuestionnaireResponse) {
        qResponse.item.forEach(item => {
            var formArray = this.controls[item.linkId] as QuestionnaireFormArray;
            var formGroup = this.controls[item.linkId] as QuestionnaireFormGroup;
            var formItem = this.controls[item.linkId] as QuestionnaireFormItem;

            if (formArray.length !== undefined)
                formArray.merge(item);
      
            else if (formGroup.controls !== undefined) {
              // FormGroup
              formGroup.merge(item)
            }
            else if (item.answer && item.answer.length > 0) {
              // FormControl
              formItem.merge(item.answer[0]);
            }      
          });
    }
}

export class QuestionnaireFormGroup extends FormGroup { 
    item: QuestionnaireItem;

    responseItem: QuestionnaireResponseItem;
    get response() : QuestionnaireResponseItem {
        return this.responseItem;    
    };


    constructor( group: QuestionnaireItem) {
        super(QuestionnaireFormGroup.createControls(group));

        this.item = group;

        this.valueChanges.subscribe(selectedValue => this.OnValueChanges(selectedValue))  
    }

    private OnValueChanges(selectedValue: any) {
        var items: QuestionnaireResponseItem[] = [];          

        this.item.item.forEach(item  => {
            var model = this.controls[item.linkId] as QuestionnaireFormItem; // this may also be QuestionnaireFormGroup or QuestionnaireFormArray
            if (model) {
              var itemData = model.response;
              if (itemData != null)
                  items.push(itemData);
            }
            else {
              console.log("model for control not found: " + item.linkId);
            }
          });
      
        if (items.length > 0) {
            this.responseItem = { 
                linkId: this.item.linkId,
                text: this.item.text,
                item: items,
            };
        }
        else
            this.responseItem = null;
    }

    merge(item: QuestionnaireResponseItem): void
    {
      item.item.forEach(item => {
        var formArray = this.controls[item.linkId] as QuestionnaireFormArray;
        var formGroup = this.controls[item.linkId] as QuestionnaireFormGroup;
        var formItem = this.controls[item.linkId] as QuestionnaireFormItem;

        if (formItem) {
          if (formArray.length !== undefined)
              formArray.merge(item);

          else if (formGroup.controls !== undefined) {
              // FormGroup
              formGroup.merge(item)
          }
          else if (item.answer && item.answer.length > 0) {
              // FormControl
              formItem.merge(item.answer[0]);
          }  
        }    
      });   
    }

    private static createControls(group: QuestionnaireItem) : { [key: string]: AbstractControl; } {
        var controls: { [key: string]: AbstractControl; } = {};
    
        group.item.forEach(item => {
    
            if (item.repeats)
                controls[item.linkId] = new QuestionnaireFormArray(item);
            else {
                switch (item.type) {
                case "group": 
                    controls[item.linkId] = new QuestionnaireFormGroup(item);
                    break;
                default:
                    controls[item.linkId] =  new QuestionnaireFormItem(item);
                }
            }
        });
    
        return controls;
    }
}

export class QuestionnaireFormArray extends FormArray { 
    private _item: QuestionnaireItem;
    get item(): QuestionnaireItem {
        return this._item;
    }

    private responseItem: QuestionnaireResponseItem;
    get response() : QuestionnaireResponseItem {
        return this.responseItem;    
    };

    
    constructor(item: QuestionnaireItem) {
        super(QuestionnaireFormArray.createControls(item));

        this._item = item;

        this.valueChanges.subscribe(selectedValue => this.OnValueChanges(selectedValue))  
    }

    private OnValueChanges(selectedValue: any) {
        var responseData: QuestionnaireResponseItem = { 
            linkId: this.item.linkId,
            text: this.item.text,
            answer: [],
          };
      
        this.controls.forEach(itemModel => {
            if (itemModel instanceof QuestionnaireFormGroup) {
                var formGroup = itemModel as QuestionnaireFormGroup;
                var groupResponse = formGroup.response;
                if (groupResponse) {
                    var answer: QuestionnaireResponseAnswer = { item: groupResponse.item }; 
                    responseData.answer.push(answer);
                }
            }
            else {
                var formControl = itemModel as QuestionnaireFormItem;
                var answer = formControl.responseAnswer;
                if (answer)
                    responseData.answer.push(answer);
            }
        });
    
        if (responseData.answer.length > 0)
            this.responseItem = responseData;
        else
            this.responseItem = null;      
    }

    merge(item: QuestionnaireResponseItem): void {
        var questionnaireFormItem: QuestionnaireFormItem;
        var firstFormGroup: QuestionnaireFormGroup;
    
        item.answer?.forEach((ans: QuestionnaireResponseAnswer, index) => {
          if (index < 1) {
            var itemModel = this.controls[index];

            if (itemModel instanceof QuestionnaireFormGroup) {
              // Populate first repeating Group
              console.log("Populate first repeating Group");
              firstFormGroup = itemModel as QuestionnaireFormGroup;
              firstFormGroup.merge(ans.item[0]);
            }
            else {
                questionnaireFormItem = itemModel as QuestionnaireFormItem;
                questionnaireFormItem.merge(ans);
            }
          }
          else {
            if (firstFormGroup) {
                console.log("Populate subsequent repeating group");
                var newFormGroup = new QuestionnaireFormGroup(firstFormGroup.item);
                newFormGroup.merge(ans.item[0]);
                this.push(newFormGroup);
            }
            else {
              var newFormItem = new QuestionnaireFormItem(questionnaireFormItem.item);
              newFormItem.merge(ans);
              this.push(newFormItem);
            }
          }
        });

        if (item.answer?.length > 0)
          this.push(new QuestionnaireFormItem(this.item));
    }
    
    private static createControls(item: QuestionnaireItem) : AbstractControl[]
    {
        var controls: AbstractControl[] = [];

        switch (item.type) {
            case "group": 
                controls.push(new QuestionnaireFormGroup(item));
                break;

            default:
                controls.push(new QuestionnaireFormItem(item));
        }

        return controls
    }
}

export class QuestionnaireFormItem extends FormControl { 
    item?: QuestionnaireItem;

    private responseItem: QuestionnaireResponseItem;
    get response() : QuestionnaireResponseItem {
        return this.responseItem;    
    };

    
    constructor(item?: QuestionnaireItem) {
        super();

        this.item = item;

        this.valueChanges.subscribe(selectedValue => this.OnValueChanges(selectedValue));  

        if (item?.required) {
          //this.validator
          this.setValidators(Validators.required);
        }
    }

    private OnValueChanges(selectedValue: any) {
        var answers : QuestionnaireResponseAnswer[] = [];

        var answer = this.getItemAnswer(selectedValue);
        if (answer) {
            answers.push(answer);

            this.responseItem = { 
                linkId: this.item.linkId,
                text: this.item.text,
                answer: answers
            };
        }
        else
          this.responseItem = null;
    }

    private getItemAnswer(selectedValue: any) {
        switch (this.item.type) {
            case "integer":
              if (selectedValue != null) {
                return { valueInteger: Number(selectedValue) };
              }
              return null;
    
            case "decimal":
              if (selectedValue != null)
              {
                  return { valueDecimal: Number(selectedValue) };
              }
              return null;
    
            /*case "quantity":
                if (item.valueQuantity != null)
                {
                    itemData.answer = { "valueQuantity": item.valueQuantity };
                    return itemData;
                }
                return null;
            */
    
            case "string":
            case "text":
              if (selectedValue != null)
              {
                  return { "valueString": selectedValue };
              }
              return null;
    
            case "date":
              if (selectedValue != null)
              {
                  return { "valueDate": new Date(selectedValue).toISOString().split('T')[0]};
              }
              return null;
    
            case "dateTime":
              if (selectedValue != null)
              {
                  return { "valueDateTime": new Date(selectedValue).toISOString()};
              }
              return null;
    
            case "boolean":
              if (selectedValue != null)
              {
                  return { "valueBoolean": selectedValue };
              }
              return null;
    
            case "choice":
              if (selectedValue != null)
              {
                var valueCoding = selectedValue as fhirclient.FHIR.Coding;
                if (valueCoding.code) {
                  return { "valueCoding": valueCoding };
                }
              }
              return null;
    
            case "open-choice":
              if (selectedValue != null)
              {
                var valueCoding = selectedValue as fhirclient.FHIR.Coding;
                if (valueCoding.code)
                  return { "valueCoding": valueCoding };
                else if (selectedValue !== '')
                  return { "valueString": selectedValue };
              }
              return null;
    
            case "display":
                return null;
    
            default:
                //debugger;
                //throw "Unhandled item type " + item.type;
                console.log(this.item.type + " not supported in getItemData!");
                break;
        };
    }

    get responseAnswer() : QuestionnaireResponseAnswer {
        if (this.responseItem != null && this.responseItem.answer?.length > 0)  
            return this.responseItem.answer[0];

        return null;        
    }

    merge(answer: QuestionnaireResponseAnswer) {
        if (answer.valueInteger !== undefined) {
          this.setValue(answer.valueInteger);
        }
        else if (answer.valueDate !== undefined) {
          this.setValue(answer.valueDate);
        }
        else if (answer.valueString !== undefined) {
          this.setValue(answer.valueString);
        }
        else if (answer.valueDecimal !== undefined) {
          this.setValue(answer.valueDecimal);
        }
        else if (answer.valueCoding !== undefined) {
          this.setValue(answer.valueCoding);
        }
        else if (answer.valueBoolean !== undefined) {
          this.setValue(answer.valueBoolean);
        }
        else {
          console.log ("Unsupported populate answer type");
          console.log (answer);
        }
      }
    
}
