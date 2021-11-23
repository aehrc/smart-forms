import { Component } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { QuestionnaireFormItem } from '../services/questionnaire-form-item.model';

import { QuestionnaireFormGroup } from '../services/questionnaire-form-group.model';
import { QuestionnaireItemBase } from './questionnaire-item-base.component';

@Component({
    selector: 'qitem-repeat',
    templateUrl: './questionnaire-item-repeat.component.html',
    styleUrls: ['./questionnaire-item.component.css']
  })
  export class QuestionnaireItemRepeatComponent extends QuestionnaireItemBase  {
    repeatArray: FormArray = new FormArray([]);
  
    onInit() {
      this.repeatArray = this.parentGroup.controls[this.item.linkId] as FormArray;
      console.log('repeating', this.item.type);
    }

    addNew() {
        if (this.item.type == "group") {
            this.repeatArray.push(new QuestionnaireFormGroup(this.item));
        }
        else {
            this.repeatArray.push(new QuestionnaireFormItem(this.item));
        }
    }

    remove(i: number) {
        var removedItem = this.repeatArray.at(i);
        this.repeatArray.removeAt(i);

        if (this.repeatArray.length < 1)
            this.addNew();
    }

    hasValue(i: number): boolean {
        var item = this.repeatArray.at(i);

        if (this.item.type != "group")
            return item.value;
        else {
            var group = item as FormGroup;  
            for(let control of Object.keys(group.controls)) {
                var c = group.controls[control];
                if (c.value)  
                    return true;
            }
            return false;
        } 
    }
  }  