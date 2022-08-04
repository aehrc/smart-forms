import { AbstractControl, FormArray, FormGroup } from "@angular/forms";
import { QuestionnaireItem } from "./questionnaire.model";
import {
  QuestionnaireResponseAnswer,
  QuestionnaireResponseItem,
} from "./questionnaire-response.service";
import { QuestionnaireFormItem } from "./questionnaire-form-item.model";

export class QuestionnaireFormGroup extends FormGroup {
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
  item: QuestionnaireItem;

  responseItem: QuestionnaireResponseItem;

  private static createControls(group: QuestionnaireItem): {
    [key: string]: AbstractControl;
  } {
    const controls: { [key: string]: AbstractControl } = {};

    group.item.forEach((item) => {
      if (item.repeats) {
        controls[item.linkId] = new QuestionnaireFormArray(item);
      } else {
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

  private OnValueChanges(selectedValue: any) {
    const items: QuestionnaireResponseItem[] = [];

    this.item.item.forEach((item) => {
      const model = this.controls[item.linkId] as QuestionnaireFormItem; // this may also be QuestionnaireFormGroup or QuestionnaireFormArray
      if (model) {
        const itemData = model.response;
        if (itemData != null) {
          items.push(itemData);
        }
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
    } else {
      this.responseItem = null;
    }
  }

  merge(responseItem: QuestionnaireResponseItem): void {
    responseItem.item.forEach((item) => {
      const formArray = this.controls[item.linkId] as QuestionnaireFormArray;
      const formGroup = this.controls[item.linkId] as QuestionnaireFormGroup;
      const formItem = this.controls[item.linkId] as QuestionnaireFormItem;

      if (formItem) {
        if (formArray.length !== undefined) {
          formArray.merge(item);
        } else if (formGroup.controls !== undefined) {
          // FormGroup
          formGroup.merge(item);
        } else if (item.answer && item.answer.length > 0) {
          // FormControl
          formItem.merge(item.answer[0]);
        }
      }
    });
  }
}

export class QuestionnaireFormArray extends FormArray {
  get item(): QuestionnaireItem {
    return this._item;
  }
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
  private _item: QuestionnaireItem;

  private responseItem: QuestionnaireResponseItem;

  private static createControls(item: QuestionnaireItem): AbstractControl[] {
    const controls: AbstractControl[] = [];

    switch (item.type) {
      case "group":
        controls.push(new QuestionnaireFormGroup(item));
        break;

      default:
        controls.push(new QuestionnaireFormItem(item));
    }

    return controls;
  }

  private OnValueChanges(selectedValue: any) {
    const responseData: QuestionnaireResponseItem = {
      linkId: this.item.linkId,
      text: this.item.text,
      answer: [],
    };

    this.controls.forEach((itemModel) => {
      if (itemModel instanceof QuestionnaireFormGroup) {
        const formGroup = itemModel as QuestionnaireFormGroup;
        const groupResponse = formGroup.response;
        if (groupResponse) {
          const answer: QuestionnaireResponseAnswer = {
            item: groupResponse.item,
          };
          responseData.answer.push(answer);
        }
      } else {
        const formControl = itemModel as QuestionnaireFormItem;
        const answer = formControl.responseAnswer;
        if (answer) {
          responseData.answer.push(answer);
        }
      }
    });

    if (responseData.answer.length > 0) {
      this.responseItem = responseData;
    } else {
      this.responseItem = null;
    }
  }

  merge(item: QuestionnaireResponseItem): void {
    let questionnaireFormItem: QuestionnaireFormItem;
    let firstFormGroup: QuestionnaireFormGroup;

    item.answer?.forEach((ans: QuestionnaireResponseAnswer, index) => {
      if (index < 1) {
        const itemModel = this.controls[index];

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
          const newFormGroup = new QuestionnaireFormGroup(firstFormGroup.item);
          newFormGroup.merge(ans.item[0]);
          this.push(newFormGroup);
        } else {
          const newFormItem = new QuestionnaireFormItem(
            questionnaireFormItem.item
          );
          newFormItem.merge(ans);
          this.push(newFormItem);
        }
      }
    });

    if (item.answer?.length > 0) {
      this.push(new QuestionnaireFormItem(this.item));
    }
  }
}
