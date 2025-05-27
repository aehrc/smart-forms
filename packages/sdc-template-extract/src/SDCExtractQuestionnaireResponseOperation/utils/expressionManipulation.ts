import type { OperationOutcomeIssue, QuestionnaireResponse } from 'fhir/r4';
import { fhirPathEvaluate } from './fhirpathEvaluate';

/**
 * Combines a base FHIRPath with an appended expression.
 * Returns the appended expression directly if it's a variable reference.
 */
export function getCombinedExpression(
  baseFhirPath: string | undefined,
  expressionToAppend: string
): string {
  // Use variable reference as-is
  if (expressionToAppend.startsWith('%')) {
    return expressionToAppend;
  }

  // baseFhirPath empty, return expression directly
  if (baseFhirPath === '' || baseFhirPath === undefined) {
    return expressionToAppend;
  }

  // valuePath starts with $this, wrap with select()
  if (expressionToAppend.startsWith('$this')) {
    return baseFhirPath + '.' + `select(${expressionToAppend})`; // Append to base path
  }

  // Default append behavior
  return baseFhirPath + '.' + expressionToAppend; // Append to base path
}

export function getNumberOfTargetInstances(
  questionnaireResponse: QuestionnaireResponse,
  targetQRItemFhirPath: string | undefined,
  warnings: OperationOutcomeIssue[]
): number {
  if (targetQRItemFhirPath) {
    const targetPathWithCount = getCombinedExpression(targetQRItemFhirPath, 'count()');
    // Otherwise, evaluate it as a FHIRPath expression
    const result = fhirPathEvaluate({
      fhirData: questionnaireResponse,
      path: targetPathWithCount,
      envVars: {},
      warnings: warnings
    });

    if (Array.isArray(result) && result.length === 1) {
      return result[0];
    }
  }

  return 0;
}

export function addIndexToTargetPath(
  baseFhirPath: string | undefined,
  index: number
): string | undefined {
  // baseFhirPath empty, return expression directly
  if (baseFhirPath === '' || baseFhirPath === undefined) {
    return baseFhirPath;
  }

  return baseFhirPath + `[${index}]`; // Append to base path
}
