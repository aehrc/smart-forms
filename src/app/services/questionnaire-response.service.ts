import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { fhirclient } from 'fhirclient/lib/types';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { Questionnaire, QuestionnaireItem } from '../services/questionnaire.service';
import { QuestionnaireForm, QuestionnaireFormArray, QuestionnaireFormGroup, QuestionnaireFormItem } from './questionnaireResponse.model';

export interface QuestionnaireResponse extends fhirclient.FHIR.Resource {
  resourceType: "QuestionnaireResponse";
  status: fhirclient.FHIR.code;
  subject?: fhirclient.FHIR.Reference;
  authored?: fhirclient.FHIR.dateTime;
  author?: fhirclient.FHIR.Reference;
  item: QuestionnaireResponseItem[];
}

export interface QuestionnaireResponseItem extends fhirclient.FHIR.BackboneElement {
  linkId: string;
  definition?: fhirclient.FHIR.uri;
  text?: string;
  answer?: QuestionnaireResponseAnswer[];
  item?: QuestionnaireResponseItem[];  
}

export interface QuestionnaireResponseAnswer extends fhirclient.FHIR.BackboneElement {
    valueBoolean?: boolean;
    valueDecimal?: number;
    valueInteger?: number;
    valueDate?: fhirclient.FHIR.dateTime;
    valueDateTime?: fhirclient.FHIR.dateTime;
    //valueTime?: fhirclient.FHIR.time;
    valueString?: string;
    valueCoding?: fhirclient.FHIR.Coding;
    //valueQuantity?: ;
    valueReference?: fhirclient.FHIR.Reference;  
    item?: QuestionnaireResponseItem[];  
}

export const isOfType = <T>(varToBeChecked: any, propertyToCheckFor: keyof T) 
  : varToBeChecked is T => 
  (varToBeChecked as T)[propertyToCheckFor] !== undefined;

@Injectable({
  providedIn: 'root'
})
export class QuestionnaireResponseService {

  private questionnaireResponseSubject: Subject<QuestionnaireResponse> = new ReplaySubject<QuestionnaireResponse>(1);

  private setQuestionnaireResponse(questionnaireResponse: QuestionnaireResponse) {
    this.questionnaireResponseSubject.next(questionnaireResponse);
  }

  getQuestionnaireResponse(): Observable<QuestionnaireResponse> {
    return this.questionnaireResponseSubject.asObservable();
  }

  constructor() { }

  /**
   * Makes Questionnaire Reactive Form model (FormGroup) from Questionnaire
   * @param questionnaire 
   * @returns FormGroup
   */
/*  makeQuestionnaireForm(questionnaire: Questionnaire) : FormGroup
  {
    var controls: { [key: string]: AbstractControl; } = {};

    questionnaire.item.forEach(item => {
      if (item.repeats)
        controls[item.linkId] = this.makeQuestionnaireRepeatItem(item);
      else {
        switch (item.type) {
          case "group": 
            controls[item.linkId] = this.makeQuestionnaireGroup(item);
            break;
          default:
            controls[item.linkId] = this.makeQuestionnaireItem(item);
        }
      }
    });

    return new FormGroup(controls);
  }

  private makeQuestionnaireGroup(group: QuestionnaireItem) : FormGroup
  {
    var controls: { [key: string]: AbstractControl; } = {};

    group.item.forEach(item => {
      if (item.repeats)
        controls[item.linkId] = this.makeQuestionnaireRepeatItem(item);
      else {
        switch (item.type) {
          case "group": 
            controls[item.linkId] = this.makeQuestionnaireGroup(item);
            break;
          default:
            controls[item.linkId] = this.makeQuestionnaireItem(item);
        }
      }
    });

    return new FormGroup(controls);
  }

  private makeQuestionnaireItem(item: QuestionnaireItem) : FormControl
  {
    var control: FormControl;

    switch (item.type) {

      default:
        control = new FormControl();
    }

    return control;
  }

  private makeQuestionnaireRepeatItem(item: QuestionnaireItem) : FormArray
  {
    var controls: AbstractControl[] = [];

    switch (item.type) {
      case "group": 
        controls.push(this.makeQuestionnaireGroup(item));
        break;

      default:
        controls.push(this.makeQuestionnaireItem(item));
    }

    return new FormArray(controls);
  }
*/

  /**
   * Sets questionnaireResponse from Questionnaire and Questionnaire Reactive Form model (FormGroup)
   * @param questionnaire 
   * @param questionnaireModel 
   */
  /*setQuestionnaireResponse(questionnaire: Questionnaire, questionnaireModel: FormGroup): void {
    this.questionnaireResponse = this.makeQuestionnaireResponse(questionnaire, questionnaireModel);
  }*/

  onQuestionnaireResponseChanged(questionnaireResponse: QuestionnaireResponse): void {
    this.setQuestionnaireResponse(questionnaireResponse);
  }

  /**
   * makes QuestionnaireResponse from Questionnaire and associated Responsive Form model (FormGroup)
   * @param questionnaire 
   * @param questionnaireModel 
   * @returns QuestionnaireResponse
   */
  /*
  makeQuestionnaireResponse(questionnaire: Questionnaire, questionnaireModel: FormGroup): QuestionnaireResponse {

    let response: QuestionnaireResponse = { 
      "resourceType": "QuestionnaireResponse",
      "questionnaire": "Questionnaire/" + questionnaire.id,
      "status": "in-progress",
      "subject": { "reference": null },
      "authored": new Date().toISOString(),
      "author": null,
      "item": []
    };

    questionnaire.item.forEach(item  => {
      var model = questionnaireModel.controls[item.linkId];
      if (model) {
        var itemData = this.getItemData(item, model);
        if (itemData != null)
            response.item.push(itemData);
      }
      else {
        console.log("model for control not found: " + item.linkId);
      }
    });

    return response;
  };

  
  private getRepeatData(item: QuestionnaireItem, formArray: FormArray): QuestionnaireResponseItem {
    var responseData: QuestionnaireResponseItem = { 
      linkId: item.linkId,
      text: item.text,
      answer: [],
    };

    //var itemData: QuestionnaireResponseItem ;
    formArray.controls.forEach(itemModel => {
      if (itemModel instanceof FormGroup) {
        var itemData = this.getItemData(item, itemModel);
        if (itemData)
          responseData.answer.push(itemData);
      }
      else {
        var formControl = itemModel as FormControl;
        var answer = this.getItemAnswer(item, formControl);
        if (answer)
          responseData.answer.push(answer);
      }
    });

    if (responseData.answer.length > 0)
      return responseData;
    else
      return null;
  }
  

  private getItemData(item: QuestionnaireItem, model: AbstractControl): QuestionnaireResponseItem {
    var itemData: QuestionnaireResponseItem = { 
        linkId: item.linkId,
        text: item.text,
        answer: []                
    };

    switch (item.type) {
        case "group":
          var groupModel = model as FormGroup;
          var groupData: QuestionnaireResponseItem[] = [];

          item.item.forEach(item => {
            var itemModel = groupModel.controls[item.linkId];
            if (itemModel) {
              if (itemModel instanceof FormArray)
              {
                var itemData = this.getRepeatData(item, itemModel);
                if (itemData != null)
                  groupData.push(itemData);
              }
              else {
                var itemData = this.getItemData(item, itemModel);
                if (itemData != null)
                    groupData.push(itemData);
              }
            }
            else {  
              console.log("model for control not found: " + item.linkId);
            }
          });

          if (groupData.length > 0)
          {
              itemData.item = groupData;
              itemData.answer = null;
              return itemData;
          }
          return null;

        default:
//            console.log(item.type + " not supported in getItemData!");
          var formControl = model as FormControl;
          var answer = this.getItemAnswer(item, formControl);
          if (answer)
            itemData.answer.push(answer);
          else
            return null;
          return itemData;
    };
  }

  private getItemAnswer(item: QuestionnaireItem, formControl: FormControl) {
    var answer: []                    

    switch (item.type) {
        case "integer":
          if (formControl.value != null) {
            return { valueInteger: Number(formControl.value) };
          }
          return null;

        case "decimal":
          if (formControl.value != null)
          {
              return { valueDecimal: Number(formControl.value) };
          }
          return null;

        case "string":
        case "text":
          if (formControl.value != null)
          {
              return { "valueString": formControl.value };
          }
          return null;

        case "date":
          if (formControl.value != null)
          {
              return { "valueDate": new Date(formControl.value).toISOString().split('T')[0]};
          }
          return null;

        case "dateTime":
          if (formControl.value != null)
          {
              return { "valueDateTime": new Date(formControl.value).toISOString()};
          }
          return null;

        case "boolean":
          if (formControl.value != null)
          {
              return { "valueBoolean": formControl.value };
          }
          return null;

        case "choice":
          if (formControl.value != null)
            {
                var i=0;
                var coding = null;
                while (i < item.answerOption.length) { 
                    if (item.answerOption[i].valueCoding.code == formControl.value ) {
                        coding = item.answerOption[i];
                        break;
                    }
                    i++;
                }
                if (coding) {
                    return coding;
                }
            }
            return null;

        case "open-choice":
          if (formControl.value != null)
          {
              //return { "valueString": formControl.value };
          }
          return null;

        case "display":
            return null;

        default:
            //debugger;
            //throw "Unhandled item type " + item.type;
            console.log(item.type + " not supported in getItemData!");
            break;
    };
  }
*/
    /**
   * Makes Questionnaire Reactive Form model (FormGroup) from Questionnaire
   * @param questionnaire 
   * @returns FormGroup
   */
/*      

  makeQuestionnaireFormModel(questionnaire: Questionnaire) : QuestionnaireForm
  {
    var controls: { [key: string]: AbstractControl; } = {};

    questionnaire.item.forEach(item => {

      if (item.repeats)
        controls[item.linkId] = this.makeQuestionnaireFormArray(item);
      else {
        switch (item.type) {
          case "group": 
            controls[item.linkId] = this.makeQuestionnaireFormGroup(item);
            break;
          default:
            controls[item.linkId] =  this.makeQuestionnaireFormItem(item);
        }
      }
    });

    return new QuestionnaireForm(questionnaire, controls);
  }

  private makeQuestionnaireFormArray(item: QuestionnaireItem) : QuestionnaireFormArray
  {
    var controls: AbstractControl[] = [];

    switch (item.type) {
      case "group": 
        controls.push(this.makeQuestionnaireFormGroup(item));
        break;

      default:
        controls.push(this.makeQuestionnaireFormItem(item));
    }

    var model = new QuestionnaireFormArray(controls);
    model.item = item;

    return model;
  }

  private makeQuestionnaireFormGroup(group: QuestionnaireItem) : QuestionnaireFormGroup
  {
    var controls: { [key: string]: AbstractControl; } = {};

    group.item.forEach(item => {

      if (item.repeats)
        controls[item.linkId] = this.makeQuestionnaireFormArray(item);
      else {
        switch (item.type) {
          case "group": 
            controls[item.linkId] = this.makeQuestionnaireFormGroup(item);
            break;
          default:
            controls[item.linkId] =  this.makeQuestionnaireFormItem(item);
        }
      }
    });

    var model = new QuestionnaireFormGroup(controls);

    model.item = group;

    return model;
  }
  private makeQuestionnaireFormItem(item: QuestionnaireItem): QuestionnaireFormItem
  {
    var model = new QuestionnaireFormItem(item);

    return model;
  }
*/

  /**
   * Makes Questionnaire Reactive Form model (FormGroup) from Questionnaire
   * @param questionnaire 
   * @returns FormGroup
   */
  /*makeQResponseFormModel(questionnaire: Questionnaire) : QuestionnaireGroup
  {
    var controls: { [key: string]: AbstractControl; } = {};

    questionnaire.item.forEach(item => {
      var childItem: QuestionnaireModelBase;

      if (item.repeats)
        childItem = this.makeQResponseRepeatModel(item);
      else {
        switch (item.type) {
          case "group": 
          childItem = this.makeQResponseGroupModel(item);
            break;
          default:
            childItem = this.makeQResponseItemModel(item);
        }
      }
      controls[item.linkId] = childItem.formModel;
    });

    var model: QuestionnaireGroup = {
      questionnaireItem: null,
      responseItem: null,
      formModel: new FormGroup(controls)
    };

    return model;
  }

  private makeQResponseRepeatModel(item: QuestionnaireItem) : QuestionnaireArray
  {
    var controls: AbstractControl[] = [];

    switch (item.type) {
      case "group": 
        controls.push(this.makeQuestionnaireGroup(item));
        break;

      default:
        controls.push(this.makeQuestionnaireItem(item));
    }

    return null; 
  }
      
  private makeQResponseGroupModel(group: QuestionnaireItem) : QuestionnaireGroup
  {
    var controls: { [key: string]: AbstractControl; } = {};

    group.item.forEach(item => {
      var childItem: QuestionnaireModelBase;

      if (item.repeats)
        childItem = this.makeQResponseRepeatModel(item);
      else {
        switch (item.type) {
          case "group": 
          childItem = this.makeQResponseGroupModel(item);
            break;
          default:
            childItem = this.makeQResponseItemModel(item);
        }
      }
      controls[item.linkId] = childItem.formModel;
    });

    var model: QuestionnaireGroup = {
      questionnaireItem: group,
      responseItem: null,
      formModel: new FormGroup(controls)
    };

    return model;
  }

  private makeQResponseItemModel(item: QuestionnaireItem) :     QuestionnaireItemModel
  {
    var formControl: AbstractControl = null;

    switch (item.type) {
      default:
        formControl = new FormControl();
    }

    var model: QuestionnaireItemModel = {
      questionnaireItem: item,
      formModel: formControl,
      responseItem: null
    };

    return model;
  }*/
}
