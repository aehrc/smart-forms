import { AbstractControl, FormGroup } from "@angular/forms";
import { Questionnaire } from "./questionnaire.model";
import {
  QuestionnaireResponse,
  QuestionnaireResponseItem,
} from "./questionnaire-response.service";
import { Observable, ReplaySubject, Subject, Subscription } from "rxjs";
import { fhirclient } from "fhirclient/lib/types";
import { QuestionnaireFormItem } from "./questionnaire-form-item.model";
import {
  QuestionnaireFormArray,
  QuestionnaireFormGroup,
} from "./questionnaire-form-group.model";
import * as fhirpath from "fhirpath";
import * as fhirpath_r4_model from "fhirpath/fhir-context/r4";

export class QuestionnaireForm extends FormGroup {
  get questionnaire(): Questionnaire {
    return this._questionnaire;
  }

  constructor(
    questionnaire: Questionnaire,
    patient$: Observable<fhirclient.FHIR.Patient>
  ) {
    super(QuestionnaireForm.createControls(questionnaire));

    patient$.subscribe((p) => {
      this.patient = p;
    });

    this._questionnaire = questionnaire;
    this._questionnaire.item.forEach((item) => {
      if (item.extension) {
        item.extension
          .filter(
            (e) => e.url === "http://hl7.org/fhir/StructureDefinition/variable"
          )
          .forEach((v) => {
            this.variables.push(v.valueExpression);
          });
      }
    });

    this.calculatedExpressions = [];

    this.valueChanges.subscribe((selectedValue) =>
      this.OnValueChanges(selectedValue)
    );

    this.OnValueChanges(null);
  }

  private set questionnaireResponse(
    questionnaireResponse: QuestionnaireResponse
  ) {
    this.questionnaireResponseSubject.next(questionnaireResponse);
  }

  get questionnaireResponse$(): Observable<QuestionnaireResponse> {
    return this.questionnaireResponseSubject.asObservable();
  }
  private _questionnaire: Questionnaire;

  private patient: fhirclient.FHIR.Patient;
  public variables = [];
  private calculatedExpressions;

  private responseSubscription: Subscription;

  private questionnaireResponseSubject: Subject<QuestionnaireResponse> =
    new ReplaySubject<QuestionnaireResponse>(1);

  private static createControls(questionnaire: Questionnaire): {
    [key: string]: AbstractControl;
  } {
    const controls: { [key: string]: AbstractControl } = {};

    questionnaire.item.forEach((item) => {
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

    this._questionnaire.item.forEach((item) => {
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

    const qr: QuestionnaireResponse = {
      resourceType: "QuestionnaireResponse",
      questionnaire: "Questionnaire/" + this._questionnaire.id,
      status: "in-progress",
      subject: {
        reference: this.patient ? "patient/" + this.patient.id : null,
      },
      authored: new Date().toISOString(),
      author: null,
      item: items,
    };

    this.questionnaireResponse = qr;
  }

  onResponseChange(
    form: QuestionnaireForm,
    qr: QuestionnaireResponse,
    calculatedExpressions
  ) {
    if (calculatedExpressions.length > 0) {
      const context = {};
      context["questionnaire"] = form.questionnaire;
      context["resource"] = qr;

      if (form.variables.length > 0 && qr.item?.length > 0) {
        form.variables.forEach((v) => {
          console.log("Evaluating variable " + v.name + ": " + v.expression);
          const result = fhirpath.evaluate(
            qr.item[0],
            { base: "QuestionnaireResponse.item", expression: v.expression },
            context,
            fhirpath_r4_model
          );
          context[v.name] = result;
          if (result.length > 0) {
            console.log(result[0]);
          }
        });

        calculatedExpressions.forEach((e) => {
          console.log(
            "Evaluating expression " + e.description + ": " + e.expression
          );
          const result = fhirpath.evaluate(
            qr,
            e.expression,
            context,
            fhirpath_r4_model
          );

          if (result.length > 0) {
            console.log(result[0]);
            if (e.item.value !== result[0]) {
              e.item.setValue(result[0]);
            }
          }
        });
      }
    }
  }

  merge(qResponse: QuestionnaireResponse) {
    qResponse.item.forEach((item) => {
      const formArray = this.controls[item.linkId] as QuestionnaireFormArray;
      const formGroup = this.controls[item.linkId] as QuestionnaireFormGroup;
      const formItem = this.controls[item.linkId] as QuestionnaireFormItem;

      if (formArray.length !== undefined) {
        formArray.merge(item);
      } else if (formGroup.controls !== undefined) {
        // FormGroup
        formGroup.merge(item);
      } else if (item.answer && item.answer.length > 0) {
        // FormControl
        formItem.merge(item.answer[0]);
      }
    });

    if (!this.responseSubscription) {
      this.responseSubscription = this.questionnaireResponse$.subscribe((qr) =>
        this.onResponseChange(this, qr, this.calculatedExpressions)
      );
    }
  }

  addCalculatedExpression(item: QuestionnaireFormItem, expression): void {
    if (!this.calculatedExpressions.find((i) => i.item === item)) {
      this.calculatedExpressions.push({ item: item, expression: expression });
    }
  }
}
