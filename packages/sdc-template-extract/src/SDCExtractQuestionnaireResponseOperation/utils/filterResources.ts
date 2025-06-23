import type { FhirResource } from 'fhir/r4';
import { parametersIsFhirPatch } from './typePredicates';
import type { FhirPatchParameterEntry } from '../interfaces/fhirpatch.interface';

/**
 * Determines whether a single extracted FHIR resource should be included in the bundle.
 *
 * Applies two filtering rules:
 * 1. **FHIRPatch validity filtering**: If the resource is a PATCH-type `Parameters`, include it only if the `value[x]` field inside the `operation.value` part is present and non-empty.
 * 2. **Change detection**: If a `comparisonResource` is provided, include this resource only if it differs from the original (e.g., the pre-populated resource). For Parameters resources, check each parameter entry.
 *
 * @param extractedResource - The newly extracted FHIR resource to evaluate.
 * @param comparisonResource - The source (pre-populated) resource to compare against, if available.
 * @returns `true` if the resource should be included in the extracted bundle; `false` otherwise.
 */
export function applyFilters(
  extractedResource: FhirResource,
  comparisonResource: FhirResource | null
): FhirResource | null {
  // Resource is a FHIRPatch Parameters resource
  if (extractedResource.resourceType === 'Parameters' && parametersIsFhirPatch(extractedResource)) {
    // First filter criteria: Filter out operation entries where the value[x] is empty
    extractedResource.parameter = filterFhirPatchEmptyValues(extractedResource.parameter);

    // Second filter criteria: check if answers have changed between the pre-populated QR and the final QR. For Parameters resources, check each operation entry.
    if (
      comparisonResource &&
      comparisonResource.resourceType === 'Parameters' &&
      parametersIsFhirPatch(comparisonResource)
    ) {
      // Comparison resource need to go through the same filtering
      comparisonResource.parameter = filterFhirPatchEmptyValues(comparisonResource.parameter);

      // Filter out entries from extractedResource where the answers have not changed in comparison to comparisonResource
      extractedResource.parameter = filterFhirPatchChangedOperations(
        extractedResource.parameter,
        comparisonResource.parameter
      );
    }

    // If all operations were removed and none remain, skip this resource
    const hasAnyValidOperation = extractedResource.parameter.some(
      (param) => param.name === 'operation'
    );
    if (!hasAnyValidOperation) {
      return null;
    }

    return extractedResource;
  }

  // Resource is a non-FHIRPatch Parameters resource
  if (comparisonResource) {
    // Second filter criteria: IF comparisonResource is provided, check if answers have changed between the pre-populated QR and the final QR
    // Compare the extracted resource with the comparison resource
    // If they are equal, nothing has changed, so we skip it
    const resourcesAreEqual =
      JSON.stringify(extractedResource) === JSON.stringify(comparisonResource);
    if (resourcesAreEqual) {
      return null;
    }
  }

  return extractedResource;
}

// Filter out entries where the value[x] is empty
function filterFhirPatchEmptyValues(
  fhirPatchParameterEntries: FhirPatchParameterEntry[]
): FhirPatchParameterEntry[] {
  return fhirPatchParameterEntries.filter((param) => {
    const valuePart = param.part?.find((part) => part.name === 'value');
    return !fhirPatchValueIsEmpty(valuePart); // keep only if value is NOT empty
  });
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

function filterFhirPatchChangedOperations(
  extractedEntries: FhirPatchParameterEntry[],
  comparisonEntries: FhirPatchParameterEntry[]
): FhirPatchParameterEntry[] {
  const operationsToRetain: FhirPatchParameterEntry[] = [];
  for (let i = 0; i < extractedEntries.length; i++) {
    const extractedOperation = extractedEntries[i];
    const comparisonOperation = comparisonEntries[i];

    if (!extractedOperation) {
      continue; // Skip if extractedOperation is missing
    }

    const operationsAreEqual =
      JSON.stringify(extractedOperation) === JSON.stringify(comparisonOperation);
    if (operationsAreEqual) {
      continue;
    }

    // If the operation has changed, keep it in the extracted resource
    operationsToRetain.push(extractedOperation);
  }

  return operationsToRetain;
}
