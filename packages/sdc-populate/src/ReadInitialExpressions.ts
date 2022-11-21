import type { Expression, Extension, Questionnaire, QuestionnaireItem } from 'fhir/r5';
import type { InitialExpression } from './Interfaces';

/**
 * Recursively read the items within a questionnaire item and store their initial expressions in a <string, InitialExpression> key-value map
 *
 * @author Sean Fong
 */
export function readInitialExpressions(
  questionnaire: Questionnaire
): Record<string, InitialExpression> {
  if (!questionnaire.item) return {};

  const initialExpressions = {};

  questionnaire.item.forEach((item) => {
    readQuestionnaireItem(item, initialExpressions);
  });
  return initialExpressions;
}

/**
 * Recursively read a single questionnaire item/group and save its initialExpression into the object if present
 *
 * @author Sean Fong
 */
function readQuestionnaireItem(
  item: QuestionnaireItem,
  initialExpressions: Record<string, InitialExpression>
): Record<string, InitialExpression> {
  const items = item.item;
  if (items && items.length > 0) {
    // iterate through items of item recursively
    items.forEach((item) => {
      readQuestionnaireItem(item, initialExpressions);
    });

    return initialExpressions;
  }

  // Read initial expression of qItem
  const initialExpression = getInitialExpression(item);
  if (initialExpression && initialExpression.expression) {
    initialExpressions[item.linkId] = {
      expression: initialExpression.expression,
      value: undefined
    };
  }

  return initialExpressions;
}

/**
 * Check if a questionnaireItem contains an initialExpression
 *
 * @author Sean Fong
 */
export function getInitialExpression(qItem: QuestionnaireItem): Expression | null {
  const itemControl = qItem.extension?.find(
    (extension: Extension) =>
      extension.url ===
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression'
  );

  if (itemControl) {
    if (itemControl.valueExpression) {
      return itemControl.valueExpression;
    }
  }
  return null;
}
