import type { InitialExpression } from './Interfaces';
import type { Bundle } from 'fhir/r5';

export function constructVariableMap(bundle: Bundle): Record<string, Bundle> {
  const variableMap: Record<string, Bundle> = {};
  if (bundle.entry) {
    for (const entry of bundle.entry) {
      const resource = entry.resource;
      if (resource && resource.id && resource.resourceType === 'Bundle') {
        variableMap[resource.id] = resource;
      }
    }
  }
  return variableMap;
}

function getVariableName(expression: string): string | null {
  const regExp = /%[a-zA-Z0-9]+/;
  let match = expression.match(regExp)?.toString();

  // Remove '%' character from variable name
  if (match) {
    match = match.slice(1);
    return match;
  }

  return null;
}

export function addVariablesToContext(
  initialExpressions: Record<string, InitialExpression>,
  context: Record<string, any>,
  batchResponse: Bundle
): Record<string, any> {
  const variableMap = constructVariableMap(batchResponse);

  for (const linkId in initialExpressions) {
    const initialExpression = initialExpressions[linkId];
    if (initialExpression) {
      const expression = initialExpression.expression;

      // Identify variable name from expression
      const variable = getVariableName(expression);

      // Add variable to context
      if (variable && variableMap[variable]) {
        context[variable] = variableMap[variable];
      }
    }
  }
  return context;
}
