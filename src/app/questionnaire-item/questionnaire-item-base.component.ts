import { OnInit, Input, Pipe, PipeTransform } from "@angular/core";
import { AbstractControl } from "@angular/forms";
import { from, Observable, of } from "rxjs";
import { first, mergeMap, switchMap } from "rxjs/operators";
import { QuestionnaireResponseService } from "../services/questionnaire-response.service";

import { QuestionnaireItem } from "../services/questionnaire.model";
import { QuestionnaireFormGroup } from "../services/questionnaire-form-group.model";
import { EnableWhenService } from "../services/enable-when.service";

@Pipe({
  name: "shortTextOrText",
})
export class ShortTextOrTextFilterPipe implements PipeTransform {
  // value - QuestionnaireItem
  // return vaue of shortText extension if it exists, otherwise item text
  transform(value: QuestionnaireItem): string {
    return this.shortText(value) || value.text;
  }

  private shortText(item: QuestionnaireItem) {
    const extension = item.extension?.find(
      (e) =>
        e.url ===
        "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-shortText"
    );
    if (extension) {
      return extension.valueString;
    }
    return null;
  }
}

export abstract class QuestionnaireItemBase implements OnInit {
  @Input() item: QuestionnaireItem;

  @Input() parentGroup: QuestionnaireFormGroup;
  @Input() repeat: AbstractControl;

  constructor(
    private qresponseService: QuestionnaireResponseService,
    private enableWhenService: EnableWhenService
  ) {}

  abstract onInit(): void;

  ngOnInit(): void {
    this.onInit();
  }

  questionnaireInstruction(): string {
    const extension = this.item.extension?.find(
      (e) =>
        e.url ===
        "http://hl7.org/fhir/StructureDefinition/questionnaire-instruction"
    );
    if (extension) {
      return extension.valueString;
    }
    return null;
  }

  isHidden(): boolean {
    const extension = this.item.extension?.find(
      (e) =>
        e.url === "http://hl7.org/fhir/StructureDefinition/questionnaire-hidden"
    );
    if (extension) {
      return extension.valueBoolean;
    }
    return false;
  }

  // TODO run this function onInit too
  enableWhen(): Observable<boolean> {
    if (this.item.enableWhen?.length > 0) {
      return from(this.item.enableWhen).pipe(
        mergeMap((whenExpr) =>
          // find question in questionnaire response
          this.qresponseService.findItem(whenExpr.question).pipe(
            switchMap((qItem) => {
              let result: boolean;

              const itemAnswer = qItem.answer[0];
              // compare value with whenExpr.answer[x]
              if (qItem.answer?.length > 0) {
                const ans = qItem.answer[0];

                if (ans.valueInteger) {
                  result = this.enableWhenService.compareWhenExprAnswerInteger(
                    itemAnswer,
                    whenExpr
                  );
                } else if (ans.valueCoding) {
                  result = this.enableWhenService.compareWhenExprAnswerCoding(
                    itemAnswer,
                    whenExpr
                  );
                } else if (ans.valueBoolean !== undefined) {
                  result = this.enableWhenService.compareWhenExprAnswerBoolean(
                    itemAnswer,
                    whenExpr
                  );
                } else {
                  result = true;
                }
              }
              return of(result);
            })
          )
        ),
        first<boolean>((result) => result === true, false)
      );
    }
    return of(true);
  }
}
