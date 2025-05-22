import { fhirPathEvaluate } from './fhirpathEvaluate';

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

  // Strip trailing `_field.extension[x]` pattern to get the writable path
  const writableSegments: (string | number)[] = [];
  for (let i = 0; i < segments.length; i++) {
    const current = segments[i];
    const next = segments[i + 1];
    const afterNext = segments[i + 2];

    // Detect pattern like: "_field", "extension", number
    if (
      typeof current === 'string' &&
      current.startsWith('_') &&
      next === 'extension' &&
      typeof afterNext === 'number'
    ) {
      writableSegments.push(current.slice(1)); // Replace "_field" → "field"
      break; // Stop here — rest is templating structure
    }

    // Final "_field" (e.g., Patient._gender) — just strip underscore
    if (typeof current === 'string' && current.startsWith('_') && i === segments.length - 1) {
      writableSegments.push(current.slice(1));
    }
    // Otherwise, just add the current segment as usual, with a guard against undefined
    else if (current !== undefined) {
      writableSegments.push(current);
    }
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
 * @returns {(string | number)[]} - The adjusted path to use for deletion. Either the original full path or a truncated one if only one extension exists.
 */
export function getAdjustedDeletePathSegments(
  resource: any,
  segments: (string | number)[],
  variant: 'context' | 'value'
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
    warnings: []
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
