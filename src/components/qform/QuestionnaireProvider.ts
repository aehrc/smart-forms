import questionnaireData from '../../data/resources/715.R4.json';
import { Expression, Questionnaire, QuestionnaireItem } from 'fhir/r5';
import { isCalculatedExpression } from './functions/QItemFunctions';

export class QuestionnaireProvider {
  questionnaire: Questionnaire;
  variables: Expression[];
  calculatedExpressions: Expression[];

  constructor() {
    this.questionnaire = questionnaireData as Questionnaire;
    this.variables = [];
    this.calculatedExpressions = [];
  }

  // setVariables() {
  //   this.item.forEach((item) => {
  //     if (item.extension) {
  //       item.extension
  //         .filter(
  //           (extension) => extension.url === 'http://hl7.org/fhir/StructureDefinition/variable'
  //         )
  //         .forEach((extension) => {
  //           if (extension.valueExpression) {
  //             this.variables.push(extension.valueExpression);
  //           }
  //         });
  //     }
  //   });
  // }

  // getCalculatedExpressions() {
  //   this.item.forEach((item) => {
  //     this.readQuestionnaireItem(item);
  //   });
  // }

  readQuestionnaireItem(item: QuestionnaireItem) {
    const items = item.item;
    if (items && items.length > 0) {
      items.forEach((item) => {
        this.readQuestionnaireItem(item);
      });
      return;
    }

    if (isCalculatedExpression(item)) {
      // print items with calculated expressions
      console.log(item.text);
    }

    return;
  }
}
