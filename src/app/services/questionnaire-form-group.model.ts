import { AbstractControl, FormArray, FormGroup } from "@angular/forms";
import { QuestionnaireItem } from "./questionnaire.model";
import {
  QuestionnaireResponseAnswer,
  QuestionnaireResponseItem,
} from "./questionnaire-response.service";
import { QuestionnaireFormItem } from "./questionnaire-form-item.model";

export class QuestionnaireFormGroup extends FormGroup {
  item: QuestionnaireItem;

  responseItem: QuestionnaireResponseItem;
  get response(): QuestionnaireResponseItem {
    return this.responseItem;
  }

  constructor(group: QuestionnaireItem) {
    super(QuestionnaireFormGroup.createControls(group));

    this.item = group;

    this.valueChanges.subscribe((selectedValue) =>
      this.OnValueChanges(selectedValue)
    );
  }

  private OnValueChanges(selectedValue: any) {
    var items: QuestionnaireResponseItem[] = [];

    this.item.item.forEach((item) => {
      var model = this.controls[item.linkId] as QuestionnaireFormItem; // this may also be QuestionnaireFormGroup or QuestionnaireFormArray
      if (model) {
        var itemData = model.response;
        if (itemData != null) items.push(itemData);
      } else {
        console.log("model for control not found: " + item.linkId);
      }
    });

    if (items.length > 0) {
      this.responseItem = {
        linkId: this.item.linkId,
        text: this.item.text,
        item: items,
      };
    } else this.responseItem = null;
  }

  merge(item: QuestionnaireResponseItem): void {
    item.item.forEach((item) => {
      var formArray = this.controls[item.linkId] as QuestionnaireFormArray;
      var formGroup = this.controls[item.linkId] as QuestionnaireFormGroup;
      var formItem = this.controls[item.linkId] as QuestionnaireFormItem;

      if (formItem) {
        if (formArray.length !== undefined) formArray.merge(item);
        else if (formGroup.controls !== undefined) {
          // FormGroup
          formGroup.merge(item);
        } else if (item.answer && item.answer.length > 0) {
          // FormControl
          formItem.merge(item.answer[0]);
        }
      }
    });
  }

  private static createControls(group: QuestionnaireItem): {
    [key: string]: AbstractControl;
  } {
    var controls: { [key: string]: AbstractControl } = {};

    group.item.forEach((item) => {
      if (item.repeats)
        controls[item.linkId] = new QuestionnaireFormArray(item);
      else {
        switch (item.type) {
          case "group":
            controls[item.linkId] = new QuestionnaireFormGroup(item);
            break;
          default:
            controls[item.linkId] = new QuestionnaireFormItem(item);
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
  get response(): QuestionnaireResponseItem {
    return this.responseItem;
  }

  constructor(item: QuestionnaireItem) {
    super(QuestionnaireFormArray.createControls(item));

    this._item = item;

    this.valueChanges.subscribe((selectedValue) =>
      this.OnValueChanges(selectedValue)
    );
  }

  private OnValueChanges(selectedValue: any) {
    var responseData: QuestionnaireResponseItem = {
      linkId: this.item.linkId,
      text: this.item.text,
      answer: [],
    };

    this.controls.forEach((itemModel) => {
      if (itemModel instanceof QuestionnaireFormGroup) {
        var formGroup = itemModel as QuestionnaireFormGroup;
        var groupResponse = formGroup.response;
        if (groupResponse) {
          var answer: QuestionnaireResponseAnswer = {
            item: groupResponse.item,
          };
          responseData.answer.push(answer);
        }
      } else {
        var formControl = itemModel as QuestionnaireFormItem;
        var answer = formControl.responseAnswer;
        if (answer) responseData.answer.push(answer);
      }
    });

    if (responseData.answer.length > 0) this.responseItem = responseData;
    else this.responseItem = null;
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
        } else {
          questionnaireFormItem = itemModel as QuestionnaireFormItem;
          questionnaireFormItem.merge(ans);
        }
      } else {
        if (firstFormGroup) {
          console.log("Populate subsequent repeating group");
          var newFormGroup = new QuestionnaireFormGroup(firstFormGroup.item);
          newFormGroup.merge(ans.item[0]);
          this.push(newFormGroup);
        } else {
          var newFormItem = new QuestionnaireFormItem(
            questionnaireFormItem.item
          );
          newFormItem.merge(ans);
          this.push(newFormItem);
        }
      }
    });

    if (item.answer?.length > 0)
      this.push(new QuestionnaireFormItem(this.item));
  }

  private static createControls(item: QuestionnaireItem): AbstractControl[] {
    var controls: AbstractControl[] = [];

    switch (item.type) {
      case "group":
        controls.push(new QuestionnaireFormGroup(item));
        break;

      default:
        controls.push(new QuestionnaireFormItem(item));
    }

    return controls;
  }
}
