import { Injectable } from "@angular/core";
import { QuestionnaireResponseAnswer } from "./questionnaire-response.service";
import { EnableWhen } from "./questionnaire.model";

@Injectable({
  providedIn: "root",
})
export class EnableWhenService {
  compareWhenExprAnswerInteger(
    itemAnswer: QuestionnaireResponseAnswer,
    enableWhenExpression: EnableWhen
  ): boolean {
    if (!enableWhenExpression.answerInteger) {
      return true;
    } else {
      switch (enableWhenExpression.operator) {
        case "<":
          return itemAnswer.valueInteger < enableWhenExpression.answerInteger;

        case "<=":
          return itemAnswer.valueInteger <= enableWhenExpression.answerInteger;

        case ">":
          return itemAnswer.valueInteger > enableWhenExpression.answerInteger;

        default:
          return true;
      }
    }
  }

  compareWhenExprAnswerCoding(
    itemAnswer: QuestionnaireResponseAnswer,
    enableWhenExpression: EnableWhen
  ): boolean {
    if (!enableWhenExpression.answerCoding) {
      return true;
    } else {
      switch (enableWhenExpression.operator) {
        case "=":
          return (
            itemAnswer.valueCoding.code ===
            enableWhenExpression.answerCoding.code
          );

        default:
          return true;
      }
    }
  }

  compareWhenExprAnswerBoolean(
    itemAnswer: QuestionnaireResponseAnswer,
    enableWhenExpression: EnableWhen
  ): boolean {
    // check if expr is of invalid type
    if (
      enableWhenExpression.answerInteger ||
      enableWhenExpression.answerCoding
    ) {
      return true;
    } else if (enableWhenExpression.answerBoolean) {
      // enable when true
      return itemAnswer.valueBoolean;
    } else {
      // enable when false
      return !itemAnswer.valueBoolean;
    }
  }
}
