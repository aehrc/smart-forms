import questionnaireData from '../../data/resources/715.R4.json';
import { Expression, Questionnaire, QuestionnaireItem } from 'fhir/r5';
import { getCalculatedExpression, getEnableWhenProperties } from './functions/QItemFunctions';
import { CalculatedExpression, EnableWhenProperties } from '../Interfaces';

export class QuestionnaireProvider {
  questionnaire: Questionnaire;
  variables: Expression[];
  calculatedExpressions: Record<string, CalculatedExpression>;
  enableWhenItems: Record<string, EnableWhenProperties>;

  constructor() {
    this.questionnaire = questionnaireData as Questionnaire;
    this.variables = [];
    this.calculatedExpressions = {};
    this.enableWhenItems = {};
  }

  readVariables() {
    if (!this.questionnaire.item) return;

    this.questionnaire.item.forEach((item) => {
      if (item.extension) {
        item.extension
          .filter(
            (extension) => extension.url === 'http://hl7.org/fhir/StructureDefinition/variable'
          )
          .forEach((extension) => {
            if (extension.valueExpression) {
              this.variables.push(extension.valueExpression);
            }
          });
      }
    });
  }

  readCalculatedExpressionsAndEnableWhenItems() {
    if (!this.questionnaire.item) return;

    this.questionnaire.item.forEach((item) => {
      this.readQuestionnaireItem(item);
    });
  }

  readQuestionnaireItem(item: QuestionnaireItem) {
    const items = item.item;
    if (items && items.length > 0) {
      items.forEach((item) => {
        this.readQuestionnaireItem(item);
      });
      return;
    }

    const calculatedExpression = getCalculatedExpression(item);
    if (calculatedExpression) {
      this.calculatedExpressions[item.linkId] = {
        expression: `${calculatedExpression.expression}`
      };
    }

    const enableWhenProperties = getEnableWhenProperties(item);
    if (enableWhenProperties) {
      this.enableWhenItems[item.linkId] = enableWhenProperties;
    }

    return;
  }
}
