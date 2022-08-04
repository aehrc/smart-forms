import { FormControl, Validators } from "@angular/forms";
import { QuestionnaireItem } from "./questionnaire.model";
import {
  QuestionnaireResponseAnswer,
  QuestionnaireResponseItem,
} from "./questionnaire-response.service";
import { fhirclient } from "fhirclient/lib/types";
import { QuestionnaireForm } from "./questionnaire-form.model";
import { Injector, OnInit } from "@angular/core";

export class QuestionnaireFormItem extends FormControl {
  item?: QuestionnaireItem;

  private responseItem: QuestionnaireResponseItem;

  get response(): QuestionnaireResponseItem {
    return this.responseItem;
  }

  private calculatedExpression;

  constructor(item?: QuestionnaireItem) {
    super();

    this.item = item;

    this.valueChanges.subscribe((selectedValue) =>
      this.OnValueChanges(selectedValue)
    );

    if (item?.required) {
      //this.validator
      this.setValidators(Validators.required);
    }

    if (item?.extension) {
      this.calculatedExpression = this.item.extension.find(
        (e) =>
          e.url ===
          "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression"
      )?.valueExpression;
    }
  }

  private OnValueChanges(selectedValue: any) {
    var answers: QuestionnaireResponseAnswer[] = [];

    var answer = this.getItemAnswer(selectedValue);
    if (answer) {
      answers.push(answer);

      this.responseItem = {
        linkId: this.item.linkId,
        text: this.item.text,
        answer: answers,
      };
    } else this.responseItem = null;
  }

  private getItemAnswer(selectedValue: any) {
    switch (this.item.type) {
      case "integer":
        if (selectedValue != null) {
          return { valueInteger: Number(selectedValue) };
        }
        return null;

      case "decimal":
        if (selectedValue != null) {
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
        if (selectedValue != null) {
          return { valueString: selectedValue };
        }
        return null;

      case "date":
        if (selectedValue != null) {
          return {
            valueDate: new Date(selectedValue).toISOString().split("T")[0],
          };
        }
        return null;

      case "dateTime":
        if (selectedValue != null) {
          return { valueDateTime: new Date(selectedValue).toISOString() };
        }
        return null;

      case "boolean":
        if (selectedValue != null) {
          return { valueBoolean: selectedValue };
        }
        return null;

      case "choice":
        if (selectedValue != null) {
          var valueCoding = selectedValue as fhirclient.FHIR.Coding;
          if (valueCoding.code) {
            return { valueCoding: valueCoding };
          }
        }
        return null;

      case "open-choice":
        if (selectedValue != null) {
          var valueCoding = selectedValue as fhirclient.FHIR.Coding;
          if (valueCoding.code) return { valueCoding: valueCoding };
          else if (selectedValue !== "") return { valueString: selectedValue };
        }
        return null;

      case "display":
        return null;

      default:
        //debugger;
        //throw "Unhandled item type " + item.type;
        console.log(this.item.type + " not supported in getItemData!");
        break;
    }
  }

  get responseAnswer(): QuestionnaireResponseAnswer {
    if (this.responseItem != null && this.responseItem.answer?.length > 0)
      return this.responseItem.answer[0];

    return null;
  }

  merge(answer: QuestionnaireResponseAnswer) {
    if (answer.valueInteger !== undefined) {
      this.setValue(answer.valueInteger);
    } else if (answer.valueDate !== undefined) {
      this.setValue(answer.valueDate);
    } else if (answer.valueString !== undefined) {
      this.setValue(answer.valueString);
    } else if (answer.valueDecimal !== undefined) {
      this.setValue(answer.valueDecimal);
    } else if (answer.valueCoding !== undefined) {
      this.setValue(answer.valueCoding);
    } else if (answer.valueBoolean !== undefined) {
      this.setValue(answer.valueBoolean);
    } else {
      console.log("Unsupported populate answer type");
      console.log(answer);
    }

    if (this.calculatedExpression) {
      var root = this.root as QuestionnaireForm;
      root.addCalculatedExpression(this, this.calculatedExpression.expression);
    }
  }
}
