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
 * Normalizes a FHIRPath expression by handling special cases like `$this` and `ofType()`.
 * If the expression starts with `$this`, it wraps it in `select(...)` and appends to the base path. Otherwise, it appends the expression directly to the base path.
 * ofType() expressions are converted from FHIR primitive types to System types to ease questionnaire-authoring. See https://github.com/HL7/fhirpath.js/issues/168#issuecomment-2964663757.
 */
export function normaliseExpression(expression: string) {
  let normalisedExpression = expression;

  // expression starts with $this, wrap with select()
  if (expression.includes('$this')) {
    normalisedExpression = `select(${expression})`;
  }

  // expression has "ofType", handle it by converting FHIR primitive types to System types
  if (expression.includes('ofType(')) {
    normalisedExpression = normalisedExpression.replace(
      /ofType\(([^)]+)\)/g,
      (_, fhirType) => `ofType(${convertFhirTypeToSystemType(fhirType)})`
    );
  }

  // Otherwise, return the expression as is
  return normalisedExpression;
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

type FhirType =
  | 'boolean'
  | 'string'
  | 'uri'
  | 'code'
  | 'oid'
  | 'id'
  | 'uuid'
  | 'markdown'
  | 'base64Binary'
  | 'integer'
  | 'unsignedInt'
  | 'positiveInt'
  | 'integer64'
  | 'decimal'
  | 'date'
  | 'dateTime'
  | 'instant'
  | 'time'
  | 'Quantity';

type FhirSystemType =
  | 'Boolean'
  | 'String'
  | 'Integer'
  | 'Long'
  | 'Decimal'
  | 'DateTime'
  | 'Time'
  | 'Quantity';

const fhirTypeToSystemTypeMap: Record<FhirType, FhirSystemType> = {
  boolean: 'Boolean',
  string: 'String',
  uri: 'String',
  code: 'String',
  oid: 'String',
  id: 'String',
  uuid: 'String',
  markdown: 'String',
  base64Binary: 'String',
  integer: 'Integer',
  unsignedInt: 'Integer',
  positiveInt: 'Integer',
  integer64: 'Long',
  decimal: 'Decimal',
  date: 'DateTime',
  dateTime: 'DateTime',
  instant: 'DateTime',
  time: 'Time',
  Quantity: 'Quantity'
};

/**
 * Defines automatic conversion of FHIR types to FHIRPath(System) types. Map lifted from https://github.com/HL7/fhirpath.js/blob/master/src/types.js.
 * See https://hl7.org/fhir/fhirpath.html#types.
 */
function convertFhirTypeToSystemType(type: string): string {
  return fhirTypeToSystemTypeMap[type as FhirType] ?? type;
}
