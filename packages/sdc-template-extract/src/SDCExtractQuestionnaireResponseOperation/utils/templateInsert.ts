import {
  getAdjustedDeletePathSegments,
  parseFhirPath,
  parseFhirPathToWritableSegments
} from './parseFhirPath';
import type { TemplateExtractPath } from '../interfaces/templateExtractPath.interface';
import type { FhirResource } from 'fhir/r4';
import { valueIsCoding } from './typePredicates'; // Use your existing FHIRPath parser

/**
 * Insert extracted value results to a deep clone of the given FHIR template,
 * assigning all values as strings to their corresponding `valuePath`s.
 *
 * @param {any} template - The original FHIR template to clone and populate.
 * @param {Map<string, TemplateExtractPath>} templateExtractPathMap - Map of paths and evaluated results.
 * @returns {any} - A new template with extracted values assigned into place.
 */
export function insertValuesToTemplate(
  template: FhirResource,
  templateExtractPathMap: Map<string, TemplateExtractPath>
): any {
  const mutatedTemplate = structuredClone(template); // Deep copy the template

  // Cleanup template artifacts e.g. templateExtractContext and templateExtractValue extensions
  for (const [entryPath, { contextPathTuple, valuePathMap }] of templateExtractPathMap.entries()) {
    // Delete templateExtractValue extension
    for (const [valuePath] of valuePathMap.entries()) {
      const valuePathSegments = parseFhirPath(valuePath);
      const adjustedDeletePathSegments = getAdjustedDeletePathSegments(
        mutatedTemplate,
        valuePathSegments,
        'value'
      );
      deleteExtensionAtPath(mutatedTemplate, entryPath, adjustedDeletePathSegments);
    }
    // Delete templateExtractContext extension
    const contextPath = contextPathTuple?.[0] ?? null;
    if (contextPath) {
      const contextPathSegments = parseFhirPath(contextPath);
      const adjustedDeletePathSegments = getAdjustedDeletePathSegments(
        mutatedTemplate,
        contextPathSegments,
        'context'
      );
      deleteExtensionAtPath(mutatedTemplate, entryPath, adjustedDeletePathSegments);
    }
  }

  // Insert values into the template
  for (const [, { valuePathMap }] of templateExtractPathMap.entries()) {
    for (const [valuePath, { valueResult }] of valuePathMap.entries()) {
      const writableSegments = parseFhirPathToWritableSegments(valuePath);
      insertValueAtPath(mutatedTemplate, valuePath, writableSegments, valueResult);
    }
  }

  // Remove resource.id from mutatedTemplate
  // Refer https://build.fhir.org/ig/HL7/sdc/extraction.html#template-based-extraction step 4
  if (mutatedTemplate.id) {
    delete mutatedTemplate.id;
  }

  return mutatedTemplate;
}

/**
 * Walks the object along the path and assigns the stringified value at the final location.
 *
 * @param {any} obj - The FHIR resource or nested object to walk. Can be an array, object, primitive, or null.
 * @param {string} fullPath - The full FHIRPath-style path for error reporting.
 * @param {(string | number)[]} pathSegments - The FHIRPath-style path as segments.
 * @param {any} valueResultToInsert - The value to assign at the last segment of the path.
 */
function insertValueAtPath(
  obj: any,
  fullPath: string,
  pathSegments: (string | number)[],
  valueResultToInsert: any
): void {
  if (!obj || typeof obj !== 'object') {
    return;
  }

  let current = obj;

  // Start from index "1" because we skip the first segment - usually the resourceType (e.g. "Patient")
  for (let i = 1; i < pathSegments.length - 1; i++) {
    const segment = pathSegments[i];

    // Check for malformed paths e.g. caused by invalid FHIRPath input or array index out of bounds
    if (segment === undefined) {
      throw new Error(
        `Invalid path segment from ${fullPath}, value is undefined: ${segment}, index: ${i} from insertValueAtPath().`
      );
    }

    // If the path segment doesn't exist, create the structure:
    // If the next segment is a number, assume it's an array. Otherwise, assume it's an object
    if (typeof current === 'object' && current !== null && !(segment in current)) {
      const nextSegment = pathSegments[i + 1];
      current[segment] = typeof nextSegment === 'number' ? [] : {};
    }

    // Move to the next level in the object subtree
    current = current[segment];
  }

  // Final segment: this should be an actual element name (`gender`) to write to
  const finalSegment = pathSegments[pathSegments.length - 1];

  // Validate final segment
  if (finalSegment === undefined) {
    throw new Error(
      `Invalid final segment from ${fullPath}, value is undefined: ${finalSegment} from insertValueAtPath().`
    );
  }

  const value = getValueFromResult(valueResultToInsert);

  // valueToInsert is undefined, skip assignment
  if (value === undefined) {
    return;
  }

  // Assign value at the resolved location
  current[finalSegment] = value;
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
function getValueFromResult(valueResult: any): string | number | object | undefined {
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

/**
 * Walks the object along the path and deletes the extension at the final segment.
 * Used to clean up post-insertion template artifacts, but works generically on any extension path.
 *
 * @param {any} obj - The FHIR resource or nested object to walk. Can be an array, object, primitive, or null.
 * @param {string} fullPath - The full FHIRPath-style path for error reporting.
 * @param {(string | number)[]} pathSegments - The FHIRPath-style path as segments.
 */
function deleteExtensionAtPath(
  obj: any,
  fullPath: string,
  pathSegments: (string | number)[]
): void {
  if (!obj || typeof obj !== 'object') {
    return;
  }
  const walkedNodes: any[] = [obj]; // DEBUG
  let current = obj;

  // Start from index "1" because we skip the first segment - usually the resourceType (e.g. "Patient")
  for (let i = 1; i < pathSegments.length - 1; i++) {
    const segment = pathSegments[i];

    // Check for malformed paths e.g. caused by invalid FHIRPath input or array index out of bounds
    if (segment === undefined || current == null) {
      throw new Error(
        `Invalid path segment from ${fullPath}, value is undefined: ${segment}, index: ${i} from deleteExtensionAtPath().`
      );
    }

    // Move to the next level in the object subtree
    current = current[segment];

    // Exit early if the structure doesn't exist
    if (current === undefined || current === null) {
      return;
    }

    // Save the current state of the object into walked nodes - DEBUG
    walkedNodes.push(current);
  }

  // Final segment: this should be the key or array index to delete from the resolved object
  const finalSegment = pathSegments[pathSegments.length - 1];

  // Validate final segment
  if (finalSegment === undefined) {
    throw new Error(
      `Invalid final segment from ${fullPath}, value is undefined: ${finalSegment} from deleteExtensionAtPath().`
    );
  }

  // Delete the array element (e.g., extension[0]) or object property (e.g., ._gender)
  if (typeof finalSegment === 'number' && Array.isArray(current)) {
    current.splice(finalSegment, 1);
  }
  // Check if it's an object property deletion (e.g., ._gender)
  else if (typeof finalSegment === 'string' && current && typeof current === 'object') {
    delete current[finalSegment];
  }
}
