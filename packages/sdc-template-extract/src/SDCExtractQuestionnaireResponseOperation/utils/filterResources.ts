import type { FhirResource } from 'fhir/r4';
import { parametersIsFhirPatch } from './typePredicates';

/**
 * Determines whether a single extracted FHIR resource should be included in the bundle.
 *
 * Applies two filtering rules:
 * 1. **FHIRPatch validity filtering**: If the resource is a PATCH-type `Parameters`, include it only if the `value[x]` field inside the `operation.value` part is present and non-empty.
 * 2. **Change detection**: If a `comparisonResource` is provided, include this resource only if it differs from the original (e.g., the pre-populated resource).
 *
 * @param extractedResource - The newly extracted FHIR resource to evaluate.
 * @param comparisonResource - The source (pre-populated) resource to compare against, if available.
 * @returns `true` if the resource should be included in the extracted bundle; `false` otherwise.
 */
export function shouldIncludeResource(
  extractedResource: FhirResource,
  comparisonResource: FhirResource | null
): boolean {
  // If the resource is a FHIRPatch Parameters resource, we need to filter it based on the value[x] part
  if (extractedResource.resourceType === 'Parameters' && parametersIsFhirPatch(extractedResource)) {
    // First filter criteria: FHIRPatch "value" part contains a valid value[x], include it in bundle
    const operationParam = extractedResource.parameter.find((param) => param.name === 'operation');
    const patchValueParam = operationParam?.part.find((part) => part.name === 'value');
    if (fhirPatchValueIsEmpty(patchValueParam)) {
      return false;
    }
  }

  // Second filter criteria: IF comparisonResource is provided, check if answers have changed between the pre-populated QR and the final QR
  if (comparisonResource) {
    // Compare the extracted resource with the comparison resource
    // If they are equal, nothing has changed, so we skip it
    const resourcesAreEqual =
      JSON.stringify(extractedResource) === JSON.stringify(comparisonResource);
    if (resourcesAreEqual) {
      return false;
    }
  }

  return true;
}

function fhirPatchValueIsEmpty(
  patchValueParam: { name: 'value'; [key: string]: unknown } | undefined
): boolean {
  // FHIRPatch "value" part not present
  if (!patchValueParam) {
    return true;
  }

  // FHIRPatch "value" part only has one key - meaning value[x] not present, which means the QR item doesn't have an answer
  return Object.keys(patchValueParam).length === 1;
}
