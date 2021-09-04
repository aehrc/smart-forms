import { Component } from '@angular/core';
import { FormControl, FormArray } from '@angular/forms';
import { QuestionnaireItemBase } from './questionnaire-item-base.component';

/*
@Component({
  selector: 'qitem',
  templateUrl: './questionnaire-item.component.html',
  styleUrls: ['./questionnaire-item.component.css']
})
export class QuestionnaireItemComponent extends QuestionnaireItemBase {

  onInit() {
  }
}
*/

@Component({
  selector: 'qitem-string',
  templateUrl: './questionnaire-item-string.component.html',
  styleUrls: ['./questionnaire-item.component.css']
})
export class QuestionnaireItemStringComponent extends QuestionnaireItemBase  {
  formControl = new FormControl();

  onInit() {
    if (this.parentGroup)
      this.formControl = this.parentGroup.controls[this.item.linkId] as FormControl;

    else if (this.repeat)
      this.formControl = this.repeat as FormControl;

  }
}

@Component({
  selector: 'qitem-text',
  templateUrl: './questionnaire-item-text.component.html',
  styleUrls: ['./questionnaire-item.component.css']
})
export class QuestionnaireItemTextComponent extends QuestionnaireItemBase  {
  formControl = new FormControl();

  onInit() {
    if (this.parentGroup)
      this.formControl = this.parentGroup.controls[this.item.linkId] as FormControl;
    else if (this.repeat)
      this.formControl = this.repeat as FormControl;

  }
}

@Component({
  selector: 'qitem-boolean',
  templateUrl: './questionnaire-item-boolean.component.html',
  styleUrls: ['./questionnaire-item.component.css']
})
export class QuestionnaireItemBooleanComponent extends QuestionnaireItemBase  {
  formControl = new FormControl();

  onInit() {
    if (this.parentGroup)
      this.formControl = this.parentGroup.controls[this.item.linkId] as FormControl;

  }
}

@Component({
  selector: 'qitem-date',
  templateUrl: './questionnaire-item-date.component.html',
  styleUrls: ['./questionnaire-item.component.css']
})
export class QuestionnaireItemDateComponent extends QuestionnaireItemBase  {
  formControl = new FormControl();

  onInit() {
    if (this.parentGroup)
      this.formControl = this.parentGroup.controls[this.item.linkId] as FormControl;

  }
}

@Component({
  selector: 'qitem-integer',
  templateUrl: './questionnaire-item-integer.component.html',
  styleUrls: ['./questionnaire-item.component.css']
})
export class QuestionnaireItemIntegerComponent extends QuestionnaireItemBase  {
  formControl = new FormControl();

  onInit() {
    if (this.parentGroup)
      this.formControl = this.parentGroup.controls[this.item.linkId] as FormControl;

  }
}

@Component({
  selector: 'qitem-choice',
  templateUrl: './questionnaire-item-choice.component.html',
  styleUrls: ['./questionnaire-item.component.css']
})
export class QuestionnaireItemChoiceComponent extends QuestionnaireItemBase  {

  readonly droplistOptionsCount = 6;

  formControl = new FormControl();

  checkboxes: FormArray =  new FormArray([]);

  isHorizontal: boolean = true;  

  onInit() {

    if (this.item.answerOption?.length <= this.droplistOptionsCount)
    {
      this.item.answerOption.forEach(o=> this.checkboxes.push(new FormControl()));
    }

    if (this.parentGroup)
      this.formControl = this.parentGroup.controls[this.item.linkId] as FormControl;

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

@Component({
  selector: 'qitem-datetime',
  templateUrl: './questionnaire-item-datetime.component.html',
  styleUrls: ['./questionnaire-item.component.css']
})
export class QuestionnaireItemDateTimeComponent extends QuestionnaireItemBase  {
  formControl = new FormControl();

  onInit() {
    if (this.parentGroup)
      this.formControl = this.parentGroup.controls[this.item.linkId] as FormControl;

  }
}

@Component({
  selector: 'qitem-decimal',
  templateUrl: './questionnaire-item-decimal.component.html',
  styleUrls: ['./questionnaire-item.component.css']
})
export class QuestionnaireItemDecimalComponent extends QuestionnaireItemBase  {
  formControl = new FormControl();

  onInit() {
    if (this.parentGroup)
      this.formControl = this.parentGroup.controls[this.item.linkId] as FormControl;
  }
}

@Component({
  selector: 'qitem-display',
  templateUrl: './questionnaire-item-display.component.html',
  styleUrls: ['./questionnaire-item.component.css']
})
export class QuestionnaireItemDisplayComponent extends QuestionnaireItemBase  {
  onInit() {
    
  }
}

@Component({
  selector: 'qitem-openchoice',
  templateUrl: './questionnaire-item-openchoice.component.html',
  styleUrls: ['./questionnaire-item.component.css']
})
export class QuestionnaireItemOpenChoiceComponent extends QuestionnaireItemBase  {
  formControl = new FormControl();

  onInit() {
  }
}

@Component({
  selector: 'qitem-quantity',
  templateUrl: './questionnaire-item-quantity.component.html',
  styleUrls: ['./questionnaire-item.component.css']
})
export class QuestionnaireItemQuantityComponent extends QuestionnaireItemBase  {
  formControl = new FormControl();

  onInit() {
  }
}
