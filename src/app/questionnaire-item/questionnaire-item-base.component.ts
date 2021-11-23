import { OnInit, Input, Pipe, PipeTransform } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { from, Observable, of } from 'rxjs';
import { first, mergeMap, switchMap } from 'rxjs/operators';
import { QuestionnaireResponseService } from '../services/questionnaire-response.service';

import { QuestionnaireItem } from '../services/questionnaire.model';
import { QuestionnaireFormGroup } from '../services/questionnaire-form-group.model';

@Pipe({
    name: 'shortTextOrText'
})
export class ShortTextOrTextFilterPipe implements PipeTransform {
  
    // value - QuestionnaireItem
    // return vaue of shortText extension if it exists, otherwise item text 
    transform(value: QuestionnaireItem): string {
        return this.shortText(value) || value.text;
    }

    private shortText(item: QuestionnaireItem) {
        var extension = item.extension?.find(e=> e.url == "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-shortText");
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
  
    constructor(private qresponseService: QuestionnaireResponseService) {        
    }

    abstract onInit() : void;
  
    ngOnInit(): void {
      this.onInit();
    }
  
    questionnaireInstruction(): string {
      var extension = this.item.extension?.find(e=> e.url == "http://hl7.org/fhir/StructureDefinition/questionnaire-instruction");
      if (extension) {
        return extension.valueString;
      }
      return null;
    }
  
    isHidden(): boolean {
      var extension = this.item.extension?.find(e=> e.url == "http://hl7.org/fhir/StructureDefinition/questionnaire-hidden");
      if (extension) {
          return extension.valueBoolean;
      }
      return false;
    }
  
    enableWhen(): Observable<boolean> {
        if (this.item.enableWhen?.length > 0) {
            return from(this.item.enableWhen).pipe(
                mergeMap(whenExpr =>  
                    // find question in questionnaire response 
                    this.qresponseService.findItem(whenExpr.question).pipe(switchMap(qItem => {
                        let result: boolean;

                        // compare value with whenExpr.answer[x]
                        if (qItem.answer?.length > 0) {
                            var ans = qItem.answer[0];

                            if (ans.valueInteger)
                            {
                                if (!whenExpr.answerInteger) {
                                    console.log(qItem.text, whenExpr.operator, this.item.text, whenExpr);
                                    result = true;
                                }
                                else switch (whenExpr.operator) {
                                    case "<":
                                        result = ans.valueInteger < whenExpr.answerInteger;
                                        break;

                                    case "<=":
                                        result = ans.valueInteger <= whenExpr.answerInteger;
                                        break;

                                    case ">":
                                        result = ans.valueInteger > whenExpr.answerInteger;
                                        break;

                                    default:
                                        console.log(qItem.text, whenExpr.operator, this.item.text, whenExpr);
                                        result = true;
                                }
                            }
                            else if (ans.valueCoding)
                            {
                                if (!whenExpr.answerCoding) {
                                    console.log(qItem.text, whenExpr.operator, this.item.text, whenExpr);
                                    result = true;
                                }
                                else switch (whenExpr.operator) {
                                    case "=":
                                        result = ans.valueCoding.code == whenExpr.answerCoding.code;
                                        break;

                                    default:
                                        console.log(qItem.text, whenExpr.operator, this.item.text, whenExpr);
                                        result = true;
                                }
                            }
                            else if (ans.valueBoolean !== undefined)
                            {
                                if (!whenExpr.answerBoolean) {
                                    console.log(qItem.text, whenExpr.operator, this.item.text, whenExpr);
                                    result = true;
                                }
                                else switch (whenExpr.operator) {
                                    case "=":
                                        result = ans.valueBoolean == whenExpr.answerBoolean;
                                        break;

                                    default:
                                        console.log(qItem.text, whenExpr.operator, this.item.text, whenExpr);
                                        result = true;
                                }
                                console.log("answerBoolean", qItem.text, whenExpr.operator, this.item.text, result);
                            }
                            else {
                                console.log(qItem.text, whenExpr.operator, this.item.text, ans);
                                result = true;
                            }
                        }
                        return of(result); 
                    })) 
                ), 
                first<boolean>(result => result == true, false)
            );
        }
        return of(true);
    }  
} 