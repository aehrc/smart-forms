import { getAdjustedDeletePathSegments, parseFhirPath } from './parseFhirPath';
import type { FhirResource, OperationOutcomeIssue } from 'fhir/r4';
import { cleanEntryPathSegments, stripTrailingIndexFromPath } from './expressionManipulation';
import { buildValuesToInsert } from './buildValueToInsert';
import type { EntryPathPosition } from '../interfaces/entryPathPosition.interface';
import { addCurrentEntryPathPosition, getStartingIndex } from './entryPathPosition';
import { getStaticTemplateDataAtPath } from './staticTemplateData';

export function removeTemplateExtractValueExtension(
  entryPath: string,
  valuePath: string,
  templateToMutate: FhirResource,
  populateIntoTemplateWarnings: OperationOutcomeIssue[]
) {
  const valuePathSegments = parseFhirPath(valuePath);
  const adjustedDeletePathSegments = getAdjustedDeletePathSegments(
    templateToMutate,
    valuePathSegments,
    'value',
    populateIntoTemplateWarnings
  );
  deleteExtensionAtPath(templateToMutate, entryPath, adjustedDeletePathSegments);
}

export function removeTemplateExtractContextExtension(
  entryPath: string,
  contextPath: string,
  templateToMutate: FhirResource,
  populateIntoTemplateWarnings: OperationOutcomeIssue[]
) {
  const contextPathSegments = parseFhirPath(contextPath);
  const adjustedDeletePathSegments = getAdjustedDeletePathSegments(
    templateToMutate,
    contextPathSegments,
    'context',
    populateIntoTemplateWarnings
  );
  deleteExtensionAtPath(templateToMutate, entryPath, adjustedDeletePathSegments);
}

/**
 * Inserts one or more evaluated values into the template at specified entry path.
 *
 * @param entryPath - Entry path where values should be inserted (e.g., "MedicationStatement.reasonCode[0]").
 * @param valuePath - The original valuePath used to derive the evaluated result.
 * @param valueResult - The evaluated result(s) from the FHIRPath expression.
 * @param entryPathPositionMap - Tracks how many values were inserted at each entry path.
 * @param templateToMutate - The target FHIR resource to be populated with evaluated values.
 * @param cleanTemplate - A clean version of the template with static template data.
 * @param populateIntoTemplateWarnings - Collects warnings or issues encountered during evaluation or insertion.
 */
export function insertValuesToPath(
  entryPath: string,
  valuePath: string,
  valueResult: any,
  entryPathPositionMap: Map<string, EntryPathPosition[]>,
  templateToMutate: FhirResource,
  cleanTemplate: FhirResource,
  populateIntoTemplateWarnings: OperationOutcomeIssue[]
) {
  const entryPathSegments = parseFhirPath(entryPath);

  const staticTemplateData = getStaticTemplateDataAtPath(
    entryPath,
    cleanTemplate,
    populateIntoTemplateWarnings
  );
  const valuesToInsert = buildValuesToInsert(
    entryPathSegments,
    valuePath,
    valueResult,
    staticTemplateData
  );
  const baseEntryPath = stripTrailingIndexFromPath(entryPath);
  const startingIndex = getStartingIndex(baseEntryPath, entryPath, entryPathPositionMap);

  addCurrentEntryPathPosition(
    baseEntryPath,
    entryPath,
    startingIndex,
    valuesToInsert.length,
    entryPathPositionMap
  );

  // Insert each valueToInsert instance into template at the correct location, taking into account context index
  for (let i = 0; i < valuesToInsert.length; i++) {
    const valueToInsert = valuesToInsert[i];
    const insertIndex = startingIndex + i;
    const cleanedEntryPathSegments = cleanEntryPathSegments(entryPathSegments, insertIndex);

    walkTemplateAndInsertValue(
      templateToMutate,
      entryPath,
      cleanedEntryPathSegments,
      valueToInsert
    );
  }
}

/**
 * Walks the object along the path and assigns the stringified value at the final location.
 *
 * @param {any} obj - The FHIR resource or nested object to walk. Can be an array, object, primitive, or null.
 * @param {string} entryPath - The full FHIRPath-style entryPath for error reporting.
 * @param {(string | number)[]} entryPathSegments - The FHIRPath-style entryPath as segments.
 * @param {any} valueToInsert - The built value to assign at the last segment of the path.
 */
export function walkTemplateAndInsertValue(
  obj: any,
  entryPath: string,
  entryPathSegments: (string | number)[],
  valueToInsert: any
): void {
  // Check if the object is valid
  if (!obj || typeof obj !== 'object') {
    return;
  }

  // valueToInsert is undefined, skip whole traversal
  if (valueToInsert === undefined) {
    return;
  }

  let current = obj;

  // Start from index "1" because we skip the first segment - usually the resourceType (e.g. "Patient")
  for (let i = 1; i < entryPathSegments.length - 1; i++) {
    const segment = entryPathSegments[i];

    // Check for malformed paths e.g. caused by invalid FHIRPath input or array index out of bounds
    if (segment === undefined) {
      throw new Error(
        `Invalid path segment from ${entryPath}, value is undefined: ${segment}, index: ${i} from insertValueAtPath().`
      );
    }

    // If the path segment doesn't exist, create the structure:
    // If the next segment is a number, assume it's an array. Otherwise, assume it's an object
    if (typeof current === 'object' && current !== null && !(segment in current)) {
      const nextSegment = entryPathSegments[i + 1];
      current[segment] = typeof nextSegment === 'number' ? [] : {};
    }

    // Move to the next level in the object subtree
    current = current[segment];
  }

  // Final segment: this should be an actual element name (`gender`) to write to
  const finalSegment = entryPathSegments[entryPathSegments.length - 1];

  // Validate final segment
  if (finalSegment === undefined) {
    throw new Error(
      `Invalid final segment from ${entryPath}, value is undefined: ${finalSegment} from insertValueAtPath().`
    );
  }

  const existingNode = current[finalSegment];

  // Existing node is null or undefined, insert the value directly
  if (existingNode === null || existingNode === undefined) {
    current[finalSegment] = valueToInsert;
    return;
  }

  // Existing node is an array, and we are inserting an array, concatenate them
  if (Array.isArray(existingNode) && Array.isArray(valueToInsert)) {
    current[finalSegment] = [...existingNode, ...valueToInsert];
    return;
  }

  // Existing node is an array, and we are inserting a single value, push it to the array
  if (Array.isArray(existingNode)) {
    existingNode.push(valueToInsert);
    return;
  }

  // Existing node is an object, and we are inserting an object, merge them
  if (typeof existingNode === 'object' && typeof valueToInsert === 'object') {
    current[finalSegment] = { ...existingNode, ...valueToInsert };
    return;
  }

  // Fallback: overwrite primitive or incompatible types
  current[finalSegment] = valueToInsert;
}

/**
 * Walks the object along the path and deletes the extension at the final segment.
 * Used to clean up post-insertion template artifacts, but works generically on any extension path.
 *
 * @param {any} obj - The FHIR resource or nested object to walk. Can be an array, object, primitive, or null.
 * @param {string} fullPath - The full FHIRPath-style path for error reporting.
 * @param {(string | number)[]} pathSegments - The FHIRPath-style path as segments.
 */
export function deleteExtensionAtPath(
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
