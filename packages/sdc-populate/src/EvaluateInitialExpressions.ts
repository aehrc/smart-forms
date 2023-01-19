import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';
import type { InitialExpression } from './Interfaces';

const unimplementedFunctions = ['join', 'split', 'trim', 'encode', 'decode'];

/**
 * Use FHIRPath.js to evaluate initialExpressions and generate its values to be populated into the questionnaireResponse.
 * There are some functions that are yet to be implemented in FHIRPath.js - these functions would be removed from the expressions to avoid errors.
 *
 * @author Sean Fong
 */
export function evaluateInitialExpressions(
  initialExpressions: Record<string, InitialExpression>,
  context: Record<string, any>
): Record<string, InitialExpression> {
  for (const linkId in initialExpressions) {
    const initialExpression = initialExpressions[linkId];
    if (initialExpression) {
      let expression = initialExpression.expression;

      // Remove unimplemented functions (split/join/trim/encode/decode)
      // NOTE: remove this code section when the functions are implemented
      if (unimplementedFunctions.some((fn: string) => initialExpression.expression.includes(fn))) {
        expression = removeUnimplementedFunction(
          unimplementedFunctions,
          initialExpression.expression
        );
      }

      // Evaluate expression by LaunchPatient or PrePopQuery
      initialExpression.value = fhirpath.evaluate({}, expression, context, fhirpath_r4_model);
      initialExpressions[linkId] = initialExpression;
    }
  }

  return initialExpressions;
}

/**
 * Check if the fhirpath expression contains any unimplemented functions and remove them from the expression
 *
 * @author Sean Fong
 */
export function removeUnimplementedFunction(
  unimplementedFunctions: string[],
  expression: string
): string {
  for (const fnName of unimplementedFunctions) {
    const foundFnIndex = expression.indexOf('.' + fnName);
    if (foundFnIndex === -1) continue;

    const openingBracketIndex = foundFnIndex + fnName.length + 1;
    const closingBracketIndex = findMatchingClosingBracketIndex(expression, openingBracketIndex);
    return expression.slice(0, foundFnIndex - 1) + expression.slice(closingBracketIndex);
  }
  return expression;
}

/**
 * For an opening bracket within an expression, find its corresponding closing bracket.
 *
 * @author Sean Fong
 */
export function findMatchingClosingBracketIndex(str: string, startPosition: number) {
  if (str[startPosition] != '(') {
    throw new Error("No '(' at index " + startPosition);
  }
  let depth = 1;
  for (let i = startPosition + 1; i < str.length; i++) {
    switch (str[i]) {
      case '(':
        depth++;
        break;
      case ')':
        if (--depth == 0) {
          return i;
        }
        break;
    }
  }
  return -1; // No matching closing parenthesis
}
