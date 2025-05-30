import type { FhirResource } from 'fhir/r4';
import { fhirPathEvaluate } from './fhirpathEvaluate';

/**
 * Retrieves static template data from a clean template at the specified FHIR path.
 *
 * @param entryPath - Entry path to evaluate (e.g., "MedicationStatement.reasonCode[0]").
 * @param cleanTemplate - A clean version of the template with static template data.
 * @returns The object at the path if found and valid, otherwise an empty object.
 */
export function getStaticTemplateDataAtPath(
  entryPath: string,
  cleanTemplate: FhirResource
): object {
  const staticTemplateDataResult = fhirPathEvaluate({
    fhirData: cleanTemplate,
    path: entryPath,
    envVars: {},
    warnings: []
  });
  if (
    Array.isArray(staticTemplateDataResult) &&
    staticTemplateDataResult.length === 1 &&
    typeof staticTemplateDataResult[0] === 'object' &&
    staticTemplateDataResult[0] !== null
  ) {
    return staticTemplateDataResult[0];
  }

  return {};
}

/**
 * Merges static template data with the value to insert, if applicable.
 *
 * @param staticTemplateData - The static template data from the template.
 * @param valueToInsert - The value to insert.
 * @returns The combined object if both are valid, otherwise the original value to insert.
 */
export function combineStaticTemplateData(staticTemplateData: object, valueToInsert: any) {
  // Combine static template data with the value to insert if applicable
  if (
    Object.keys(staticTemplateData).length > 0 &&
    typeof valueToInsert === 'object' &&
    valueToInsert !== null
  ) {
    return { ...staticTemplateData, ...valueToInsert };
  }

  // Otherwise, return the value to insert as is
  return valueToInsert;
}
