import { parseFhirPathToWritableSegments } from './parseFhirPath';
import { valueIsCoding } from './typePredicates';
import { getRelativeValuePathSegments } from './expressionManipulation';

/**
 * Builds an array of insertable values by applying value results to their relative path segments.
 *
 * @param entryPathSegments - Segments pointing to the entry location (e.g. ["Observation", "code"])
 * @param valuePath - Full FHIRPath string to the target value
 * @param valueResultsToInsert - Raw value results to insert
 * @returns Array of values shaped for insertion
 */
export function buildValuesToInsert(
  entryPathSegments: (string | number)[],
  valuePath: string,
  valueResultsToInsert: any
): any[] {
  // Get value path segments relative to the entry path
  const writableSegments = parseFhirPathToWritableSegments(valuePath);
  const relativeValuePathSegments = getRelativeValuePathSegments(
    entryPathSegments,
    writableSegments
  );

  // Not sure if this will ever happen
  if (!Array.isArray(relativeValuePathSegments)) {
    return valueResultsToInsert as any[];
  }

  const valuesToInsert = [];
  if (Array.isArray(valueResultsToInsert)) {
    for (const valueResult of valueResultsToInsert) {
      const value = getValueFromResult([valueResult]);
      const valueToInsert = buildSingleValueToInsertRecursive(relativeValuePathSegments, value);
      valuesToInsert.push(valueToInsert);
    }
  }

  return valuesToInsert;
}

/**
 * Recursively builds a nested object or array based on path segments and a value.
 *
 * @param valueSegments - Path segments to the target field
 * @param value - The value to insert at the target location
 * @returns A nested structure ready for insertion
 */
function buildSingleValueToInsertRecursive(
  valueSegments: (string | number)[],
  value: string | number | object | undefined
): any {
  if (valueSegments.length === 0) {
    return value;
  }

  const [head, ...rest] = valueSegments;

  // If the next level is a number, wrap in array
  if (typeof head === 'number') {
    const arr = [];
    arr[head] = buildSingleValueToInsertRecursive(rest, value);
    return arr;
  }

  // Validate segment
  if (head === undefined) {
    throw new Error(
      `Unexpected segment type: ${typeof head} (value: ${head}) in buildValueToInsertRecursive()`
    );
  }

  return {
    [head]: buildSingleValueToInsertRecursive(rest, value)
  };
}

/**
 * Extracts a usable value from a valueResult returned by a FHIRPath evaluation.
 *
 * - If the result is a single-item array:
 *   - If the item is a FHIR `Coding`, returns an object with only defined fields (`code`, `display`, `system`).
 *   - Otherwise, returns the single item directly.
 * - If the result is an array with multiple values or unexpected structure, returns a JSON stringified version. FIXME
 *
 * @param {any} valueResult - The result of a FHIRPath evaluation. Usually an array.
 * @returns {string | number | object} A simplified value ready for assignment to the extracted template location.
 */
function getValueFromResult(valueResult: any[]): string | number | object | undefined {
  if (Array.isArray(valueResult) && valueResult.length === 1) {
    const value = valueResult[0];
    if (valueIsCoding(value)) {
      return {
        ...(value.system && { system: value.system }),
        ...(value.code && { code: value.code }),
        ...(value.display && { display: value.display })
      };
    }

    return value;
  }

  // Return badly formed valueResult as undefined
  return undefined;
}
