import { Component } from '@angular/core';
import { FormControl, FormArray } from '@angular/forms';
import { QuestionnaireResponseService } from '../services/questionnaire-response.service';
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
  selector: 'qitem-display',
  templateUrl: './questionnaire-item-display.component.html',
  styleUrls: ['./questionnaire-item.component.css']
})
export class QuestionnaireItemDisplayComponent extends QuestionnaireItemBase  {
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
