
import { Component } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

//import { QuestionnaireItem } from '../services/questionnaire.service';
import { QuestionnaireFormGroup, QuestionnaireFormItem } from '../services/questionnaireResponse.model';
import { QuestionnaireItemBase } from './questionnaire-item.component';

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
            console.log(this.item.text, i, "valid:", item.valid,  "pristine", item.pristine, 
            "touched", item.touched, "value:", item.value);

            var group = item as FormGroup;  
            for(let control of Object.keys(group.controls)) {
                var c = group.controls[control];
                console.log(c);
                if (c.value)  
                    return true;
            }
            return false;
        } 
    }
  }  