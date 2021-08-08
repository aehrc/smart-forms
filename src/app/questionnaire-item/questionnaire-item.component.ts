import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, AbstractControl } from '@angular/forms';

import { QuestionnaireItem } from '../services/questionnaire.service';

export abstract class QuestionnaireItemBase implements OnInit {
  @Input() item: QuestionnaireItem;

  @Input() parentGroup: FormGroup;
  //@Input() parentArray: FormArray;
  @Input() repeat: AbstractControl;

  abstract init() : void;

  ngOnInit(): void {
    this.init();
  }

}

@Component({
  selector: 'qitem',
  templateUrl: './questionnaire-item.component.html',
  styleUrls: ['./questionnaire-item.component.css']
})
export class QuestionnaireItemComponent extends QuestionnaireItemBase {

  init() {

  }
}

@Component({
  selector: 'qitem-group',
  templateUrl: './questionnaire-item-group.component.html',
  styleUrls: ['./questionnaire-item.component.css']
})
export class QuestionnaireItemGroupComponent extends QuestionnaireItemBase {

  formGroup: FormGroup = new FormGroup({});

  init() {
    if (this.parentGroup)
      this.formGroup = this.parentGroup.controls[this.item.linkId] as FormGroup;

    else if (this.repeat)
      this.formGroup = this.repeat as FormGroup;

    console.log(this.formGroup);
  }
}

@Component({
  selector: 'qitem-repeat',
  templateUrl: './questionnaire-item-repeat.component.html',
  styleUrls: ['./questionnaire-item.component.css']
})
export class QuestionnaireItemRepeatComponent extends QuestionnaireItemBase  {
  repeatArray: FormArray = new FormArray([]);

  init() {
    //this.parentGroup.addControl(this.item.linkId, this.repeatArray);
    this.repeatArray = this.parentGroup.controls[this.item.linkId] as FormArray;
    console.log(this.repeatArray);
  }
}

@Component({
  selector: 'qitem-string',
  templateUrl: './questionnaire-item-string.component.html',
  styleUrls: ['./questionnaire-item.component.css']
})
export class QuestionnaireItemStringComponent extends QuestionnaireItemBase  {
  formControl = new FormControl();

  init() {
    /*if (this.parentGroup)
      this.parentGroup.addControl(this.item.linkId, this.formControl);

    if (this.parentArray)
      this.parentArray.push(this.formControl);
    */
    if (this.parentGroup)
      this.formControl = this.parentGroup.controls[this.item.linkId] as FormControl;

    else if (this.repeat)
      this.formControl = this.repeat as FormControl;

    console.log(this.formControl);
  }
}

@Component({
  selector: 'qitem-text',
  templateUrl: './questionnaire-item-text.component.html',
  styleUrls: ['./questionnaire-item.component.css']
})
export class QuestionnaireItemTextComponent extends QuestionnaireItemBase  {
  formControl = new FormControl();

  init() {
    /*
    if (this.parentGroup)
      this.parentGroup.addControl(this.item.linkId, this.formControl);

    if (this.parentArray)
      this.parentArray.push(this.formControl);
    */
    if (this.parentGroup)
      this.formControl = this.parentGroup.controls[this.item.linkId] as FormControl;
    else if (this.repeat)
      this.formControl = this.repeat as FormControl;

    console.log(this.formControl);
  }
}

@Component({
  selector: 'qitem-boolean',
  templateUrl: './questionnaire-item-boolean.component.html',
  styleUrls: ['./questionnaire-item.component.css']
})
export class QuestionnaireItemBooleanComponent extends QuestionnaireItemBase  {
  formControl = new FormControl();

  init() {
    if (this.parentGroup)
      this.formControl = this.parentGroup.controls[this.item.linkId] as FormControl;

    console.log(this.formControl);
  }
}

@Component({
  selector: 'qitem-date',
  templateUrl: './questionnaire-item-date.component.html',
  styleUrls: ['./questionnaire-item.component.css']
})
export class QuestionnaireItemDateComponent extends QuestionnaireItemBase  {
  formControl = new FormControl();

  init() {
    /*
    if (this.parentGroup)
      this.parentGroup.addControl(this.item.linkId, this.formControl);

    if (this.parentArray)
      this.parentArray.push(this.formControl);
    */
    if (this.parentGroup)
      this.formControl = this.parentGroup.controls[this.item.linkId] as FormControl;

    console.log(this.formControl);
  }
}

@Component({
  selector: 'qitem-integer',
  templateUrl: './questionnaire-item-integer.component.html',
  styleUrls: ['./questionnaire-item.component.css']
})
export class QuestionnaireItemIntegerComponent extends QuestionnaireItemBase  {
  formControl = new FormControl();

  init() {
    /*
    if (this.parentGroup)
      this.parentGroup.addControl(this.item.linkId, this.formControl);

    if (this.parentArray)
      this.parentArray.push(this.formControl);
    */
    if (this.parentGroup)
      this.formControl = this.parentGroup.controls[this.item.linkId] as FormControl;

    console.log(this.formControl);
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

  init() {
    /*
    if (this.parentGroup)
      this.parentGroup.addControl(this.item.linkId, this.formControl);

    if (this.parentArray)
      this.parentArray.push(this.formControl);
    */
    if (this.parentGroup)
      this.formControl = this.parentGroup.controls[this.item.linkId] as FormControl;

    console.log(this.formControl);
  }
}

@Component({
  selector: 'qitem-datetime',
  templateUrl: './questionnaire-item-datetime.component.html',
  styleUrls: ['./questionnaire-item.component.css']
})
export class QuestionnaireItemDateTimeComponent extends QuestionnaireItemBase  {
  formControl = new FormControl();

  init() {
    /*
    if (this.parentGroup)
      this.parentGroup.addControl(this.item.linkId, this.formControl);

    if (this.parentArray)
      this.parentArray.push(this.formControl);
    */
    if (this.parentGroup)
      this.formControl = this.parentGroup.controls[this.item.linkId] as FormControl;

    console.log(this.formControl);
  }
}

@Component({
  selector: 'qitem-decimal',
  templateUrl: './questionnaire-item-decimal.component.html',
  styleUrls: ['./questionnaire-item.component.css']
})
export class QuestionnaireItemDecimalComponent extends QuestionnaireItemBase  {
  formControl = new FormControl();

  init() {
    /*
    if (this.parentGroup)
      this.parentGroup.addControl(this.item.linkId, this.formControl);

    if (this.parentArray)
      this.parentArray.push(this.formControl);
    */
    if (this.parentGroup)
      this.formControl = this.parentGroup.controls[this.item.linkId] as FormControl;

    console.log(this.formControl);
  }
}

@Component({
  selector: 'qitem-display',
  templateUrl: './questionnaire-item-display.component.html',
  styleUrls: ['./questionnaire-item.component.css']
})
export class QuestionnaireItemDisplayComponent extends QuestionnaireItemBase  {
  init() {
    
  }
}

@Component({
  selector: 'qitem-openchoice',
  templateUrl: './questionnaire-item-openchoice.component.html',
  styleUrls: ['./questionnaire-item.component.css']
})
export class QuestionnaireItemOpenChoiceComponent extends QuestionnaireItemBase  {
  formControl = new FormControl();

  init() {
    /*
    if (this.parentGroup)
      this.parentGroup.addControl(this.item.linkId, this.formControl);

    if (this.parentArray)
      this.parentArray.push(this.formControl);
    */
  }
}

@Component({
  selector: 'qitem-quantity',
  templateUrl: './questionnaire-item-quantity.component.html',
  styleUrls: ['./questionnaire-item.component.css']
})
export class QuestionnaireItemQuantityComponent extends QuestionnaireItemBase  {
  formControl = new FormControl();

  init() {
    /*
    if (this.parentGroup)
      this.parentGroup.addControl(this.item.linkId, this.formControl);

    if (this.parentArray)
      this.parentArray.push(this.formControl);
    */
  }
}
