import questionnaireData from '../../data/resources/715.R4.json';
import { Expression, Questionnaire, QuestionnaireItem } from 'fhir/r5';
import { getCalculatedExpression, getEnableWhenItemProperties } from './functions/QItemFunctions';
import { CalculatedExpression, EnableWhenItemProperties } from '../Interfaces';

export class QuestionnaireProvider {
  questionnaire: Questionnaire;
  variables: Expression[];
  calculatedExpressions: Record<string, CalculatedExpression>;
  enableWhenItems: Record<string, EnableWhenItemProperties>;

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

      const EnableWhenItemProperties = getEnableWhenItemProperties(item);
      if (EnableWhenItemProperties) {
        this.enableWhenItems[item.linkId] = EnableWhenItemProperties;
      }
      return;
    }

    const calculatedExpression = getCalculatedExpression(item);
    if (calculatedExpression) {
      this.calculatedExpressions[item.linkId] = {
        expression: `${calculatedExpression.expression}`
      };
    }

    const EnableWhenItemProperties = getEnableWhenItemProperties(item);
    if (EnableWhenItemProperties) {
      this.enableWhenItems[item.linkId] = EnableWhenItemProperties;
    }

    return;
  }
}
