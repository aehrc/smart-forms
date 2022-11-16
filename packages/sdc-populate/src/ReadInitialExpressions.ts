import { Expression, Extension, Questionnaire, QuestionnaireItem } from 'fhir/r5';

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
