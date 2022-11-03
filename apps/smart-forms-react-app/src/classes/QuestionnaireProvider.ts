import { Expression, Questionnaire, QuestionnaireItem, ValueSet } from 'fhir/r5';
import { CalculatedExpression, EnableWhenItemProperties } from '../interfaces/Interfaces';
import { getEnableWhenItemProperties } from '../functions/EnableWhenFunctions';
import { getCalculatedExpression } from '../functions/ItemControlFunctions';

export class QuestionnaireProvider {
  questionnaire: Questionnaire;
  variables: Expression[];
  calculatedExpressions: Record<string, CalculatedExpression>;
  enableWhenItems: Record<string, EnableWhenItemProperties>;
  containedValueSets: Record<string, ValueSet>;

  constructor() {
    this.questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active'
    };
    this.variables = [];
    this.calculatedExpressions = {};
    this.enableWhenItems = {};
    this.containedValueSets = {};
  }

  setQuestionnaire(questionnaire: Questionnaire) {
    this.questionnaire = questionnaire;
    this.readCalculatedExpressionsAndEnableWhenItems();
    this.readVariables();
    this.readContainedValueSets();
  }

  /**
   * Check if an extension is a variable and gets all variable expressions
   *
   * @author Sean Fong
   */
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

  /**
   * Read all enableWhen items and calculated expressions in questionnaireResponse
   *
   * @author Sean Fong
   */
  readCalculatedExpressionsAndEnableWhenItems() {
    if (!this.questionnaire.item) return;

    this.questionnaire.item.forEach((item) => {
      this.readQuestionnaireItem(item);
    });
  }

  /**
   * Read enableWhen items and calculated expressions of each qItem recursively
   *
   * @author Sean Fong
   */
  readQuestionnaireItem(item: QuestionnaireItem) {
    const items = item.item;
    if (items && items.length > 0) {
      // iterate through items of item recursively
      items.forEach((item) => {
        this.readQuestionnaireItem(item);
      });

      // Read enableWhen item and calculated expressions of group qItem
      const EnableWhenItemProperties = getEnableWhenItemProperties(item);
      if (EnableWhenItemProperties) {
        this.enableWhenItems[item.linkId] = EnableWhenItemProperties;
      }
      return;
    }

    // Read enableWhen item and calculated expressions of simple qItem
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

  readContainedValueSets() {
    if (!this.questionnaire.contained || this.questionnaire.contained.length === 0) return;

    this.questionnaire.contained.forEach((entry) => {
      if (entry.resourceType === 'ValueSet' && entry.id) {
        this.containedValueSets[entry.id] = entry;
      }
    });
  }
}
