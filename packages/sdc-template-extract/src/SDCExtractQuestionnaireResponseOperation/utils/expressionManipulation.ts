import type { OperationOutcomeIssue, QuestionnaireResponse } from 'fhir/r4';
import { fhirPathEvaluate } from './fhirpathEvaluate';

/**
 * Combines a base FHIRPath with an appended expression.
 * Returns the appended expression directly if it's a variable reference.
 */
export function getCombinedExpression(baseFhirPath: string, expressionToAppend: string): string {
  // Use variable reference as-is
  if (expressionToAppend.includes('%')) {
    return normaliseExpression(expressionToAppend);
  }

  // baseFhirPath empty, return expression directly
  if (baseFhirPath === '') {
    return normaliseExpression(expressionToAppend);
  }

  // Default append behavior
  return baseFhirPath + '.' + normaliseExpression(expressionToAppend); // Append to base path
}

/**
 * Normalizes a FHIRPath expression by handling special cases like `$this`.
 * If the expression starts with `$this`, it wraps it in `select(...)` and appends to the base path.
 * Otherwise, it appends the expression directly to the base path.
 */
export function normaliseExpression(expression: string) {
  // expression starts with $this, wrap with select()
  if (expression.includes('$this')) {
    return `select(${expression})`;
  }

  // Otherwise, return the expression as is
  return expression;
}

export function getNumberOfTemplateInstances(
  questionnaireResponse: QuestionnaireResponse,
  targetQRItemFhirPath: string,
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

export function addIndexToTargetPath(baseFhirPath: string, index: number): string {
  // baseFhirPath empty, return expression directly
  if (baseFhirPath === '') {
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
  const newSegments = [...entryPathSegments];

  // Last segment is a number (an array index), replace it with the provided index
  const lastIndex = newSegments.length - 1;
  if (typeof newSegments[lastIndex] === 'number') {
    newSegments[lastIndex] = index;
  }

  // Last segment is a _field, strip underscore prefix (e.g. '_field' → 'field').
  if (typeof newSegments[lastIndex] === 'string' && newSegments[lastIndex].startsWith('_')) {
    newSegments[lastIndex] = stripUnderscorePrefix(newSegments[lastIndex]);
  }

  return newSegments;
}

/**
 * Removes a trailing array index from a FHIRPath string (e.g. `foo.bar[2]` → `foo.bar`)
 * @param path - FHIRPath string
 * @returns Path without trailing index
 */
export function stripTrailingIndexFromPath(path: string): string {
  return path.replace(/\[\d+\]$/, '');
}
