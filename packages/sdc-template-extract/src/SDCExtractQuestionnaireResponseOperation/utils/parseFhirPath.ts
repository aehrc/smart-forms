import { fhirPathEvaluate } from './fhirpathEvaluate';
import type { OperationOutcomeIssue } from 'fhir/r4';
import { stripUnderscorePrefix } from './expressionManipulation';

/**
 * Parses a FHIRPath-style path into a "writable" path array of property names and indices.
 * Only the field directly before `.extension[...]` or the final `_field` will be rewritten.
 * We stop at the real insertion point, ignoring `_`-prefixed paths used only in templating.
 *
 * @param {string} fhirPath - A FHIRPath-style path like "Patient.name[0]._text.extension[0]".
 * @returns {(string | number)[]} - An array of "writable "path segments: strings for property names, numbers for array indices. e.g. ["Patient", "name", 0, "text"]
 */
export function parseFhirPathToWritableSegments(fhirPath: string): (string | number)[] {
  // Matches property names and array indices in FHIRPath-style strings
  // Example: "Patient.name[0]._family.extension[0]"
  // Produces matches like: "Patient", "name", 0, "_family", "extension", 0
  const segments = parseFhirPath(fhirPath);

  // Produce writable segments
  // 1. If the path ends in '.extension[x]', strip the last two segments
  // 2. If the third last segment starts with '_', strip the underscore to get the base field
  const writableSegments: (string | number)[] = [...segments];

  // Check if the last three segments are: '_field', 'extension', number
  const len = writableSegments.length;
  if (
    len >= 3 &&
    writableSegments[len - 2] === 'extension' &&
    typeof writableSegments[len - 1] === 'number'
  ) {
    // Remove trailing `.extension[x]`
    writableSegments.splice(len - 2, 2);
  }

  // If the third last segment (currently the last segment) is a primitive wrapper (e.g. '_valueBoolean'), strip the underscore
  const last = writableSegments[writableSegments.length - 1];
  if (typeof last === 'string' && last.startsWith('_')) {
    writableSegments[writableSegments.length - 1] = stripUnderscorePrefix(last); // '_field' → 'field'
  }

  // If the last segment is a number and the second last is a primitive wrapper for an array (e.g. '_given'), strip the underscore
  const secondLast = writableSegments[writableSegments.length - 2];
  if (typeof last === 'number' && typeof secondLast === 'string' && secondLast.startsWith('_')) {
    writableSegments[writableSegments.length - 2] = stripUnderscorePrefix(secondLast); // '_field' → 'field'
  }

  return writableSegments;
}

/**
 * Parses a FHIRPath-style path into an array of property names and indices.
 *
 * @param {string} fhirPath - A FHIRPath-style path like "Patient.name[0]._family.extension[0]".
 * @returns {(string | number)[]} - An array of path segments: strings for property names, numbers for array indices.  e.g. ["Patient", "name", 0, "_family", "extension", 0]
 */
export function parseFhirPath(fhirPath: string): (string | number)[] {
  const regex = /([^.[]+)|\[(\d+)]/g;
  const segments: (string | number)[] = [];

  let match;
  while ((match = regex.exec(fhirPath)) !== null) {
    if (match[1] !== undefined) {
      segments.push(match[1]);
    } else if (match[2] !== undefined) {
      segments.push(Number(match[2]));
    }
  }

  return segments;
}

/**
 * Determines the correct delete path based on how many extensions exist.
 * If only one extension is found, returns the path to a parent node to delete the entire element.
 * If multiple extensions exist, returns the full path to delete just the specific indexed extension.
 *
 * @param {any} resource - The root FHIR resource object to evaluate.
 * @param {(string | number)[]} segments - The FHIRPath-style path as an array of segments, e.g. ["Patient", "_gender", "extension", 0].
 * @param {'context' | 'value'} variant - The variant type, either 'context' or 'value'.
 * @param {OperationOutcomeIssue[]} populateIntoTemplateWarnings - An array to collect any warnings encountered during evaluation.
 * @returns {(string | number)[]} - The adjusted path to use for deletion. Either the original full path or a truncated one if only one extension exists.
 */
export function getAdjustedDeletePathSegments(
  resource: any,
  segments: (string | number)[],
  variant: 'context' | 'value',
  populateIntoTemplateWarnings: OperationOutcomeIssue[]
): (string | number)[] {
  // Get path to the extension array
  const lastNodeExtensionsPath = segments
    .slice(0, -1) // drop the final index (e.g., extension[0])
    .map((segment) => (typeof segment === 'number' ? `[${segment}]` : `.${segment}`))
    .join('')
    .replace(/^\./, ''); // remove leading dot if it exists

  const extensions = fhirPathEvaluate({
    fhirData: resource,
    path: lastNodeExtensionsPath,
    envVars: {},
    warnings: populateIntoTemplateWarnings
  });

  // Target extension is the only extension in the array, return the path to a parent node
  // Depending on the variant, these are the outcomes:
  // e.g. variant="context": ["Patient", "identifier", "extension"] - to delete "extension".
  // e.g. variant="value": ["Patient", "_gender"] - to delete "_gender"
  if (Array.isArray(extensions) && extensions.length === 1) {
    return variant === 'context' ? segments.slice(0, -1) : segments.slice(0, -2);
  }

  // Keep full path if more than one extension
  return segments;
}
