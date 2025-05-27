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

/**
 * Derives the relative value path segments for a value from the full writable path and the entry path.
 *
 * @param entryPathSegments - Segments pointing to the entry location (e.g. ["MedicationStatement", "reasonCode", 0])
 * @param writablePathSegments - Segments pointing to the writable value location (e.g. ["MedicationStatement", "reasonCode", 0, "coding", 0])
 * @returns The relative value path segments (e.g. ["coding", 0])
 */
export function getRelativeValuePathSegments(
  entryPathSegments: (string | number)[],
  writablePathSegments: (string | number)[]
): (string | number)[] {
  // Safety check: entrySegments must be a prefix of writableSegments
  for (let i = 0; i < entryPathSegments.length; i++) {
    if (entryPathSegments[i] !== entryPathSegments[i]) {
      throw new Error(
        `entryPathSegments must be a prefix of writablePathSegments. Mismatch at index ${i}.`
      );
    }
  }

  // Return the relative path after the entry point
  return writablePathSegments.slice(entryPathSegments.length);
}

/**
 * Removes leading underscore from a string segment (e.g. '_field' → 'field').
 * Returns non-string segments unchanged.
 */
export function stripUnderscorePrefix(segment: string | number): string | number {
  if (typeof segment === 'string' && segment.startsWith('_')) {
    return segment.slice(1);
  }
  return segment;
}

/**
 * Returns updated entry and writable segments:
 * - Replaces the last entry segment with index if it's a number
 * - Strips underscore prefix from the last segment if it's a string starting with '_'
 */
export function cleanEntryPathSegments(
  entryPathSegments: (string | number)[],
  index: number
): (string | number)[] {
  // Last segment is a number (an array index), replace it with the provided index
  const lastIndex = entryPathSegments.length - 1;
  if (typeof entryPathSegments[lastIndex] === 'number') {
    entryPathSegments[lastIndex] = index;
  }

  // Last segment is a _field, strip underscore prefix (e.g. '_field' → 'field').
  if (
    typeof entryPathSegments[lastIndex] === 'string' &&
    entryPathSegments[lastIndex].startsWith('_')
  ) {
    entryPathSegments[lastIndex] = stripUnderscorePrefix(entryPathSegments[lastIndex]);
  }

  return entryPathSegments;
}
