import { Injectable } from "@angular/core";
import { QuestionnaireResponseItem } from "./questionnaire-response.service";
import { EnableWhen } from "./questionnaire.model";

@Injectable({
  providedIn: "root",
})
export class EnableWhenService {
  compareWhenExprAnswerInteger(
    qItem: QuestionnaireResponseItem,
    whenExpr: EnableWhen
  ): boolean {
    const itemAnswer = qItem.answer[0];

    if (!whenExpr.answerInteger) {
      return true;
    } else {
      switch (whenExpr.operator) {
        case "<":
          return itemAnswer.valueInteger < whenExpr.answerInteger;

        case "<=":
          return itemAnswer.valueInteger <= whenExpr.answerInteger;

        case ">":
          return itemAnswer.valueInteger > whenExpr.answerInteger;

        default:
          return true;
      }
    }
  }

  compareWhenExprAnswerCoding(
    qItem: QuestionnaireResponseItem,
    whenExpr: EnableWhen
  ): boolean {
    const itemAnswer = qItem.answer[0];

    if (!whenExpr.answerCoding) {
      return true;
    } else {
      switch (whenExpr.operator) {
        case "=":
          return itemAnswer.valueCoding.code === whenExpr.answerCoding.code;

        default:
          return true;
      }
    }
  }

  compareWhenExprAnswerBoolean(
    qItem: QuestionnaireResponseItem,
    whenExpr: EnableWhen
  ): boolean {
    const itemAnswer = qItem.answer[0];

    // enable when true
    if (whenExpr.answerBoolean) {
      return itemAnswer.valueBoolean;
    } else {
      // enable when false
      return !itemAnswer.valueBoolean;
    }
  }
}
