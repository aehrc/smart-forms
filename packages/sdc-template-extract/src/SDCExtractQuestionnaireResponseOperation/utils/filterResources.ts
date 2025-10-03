import type { FhirResource, Parameters } from 'fhir/r4';
import {
  isFhirPatchNamePart,
  isFhirPatchPathPart,
  isFhirPatchTypePart,
  parametersIsFhirPatch
} from './typePredicates';
import type {
  FhirPatchParameterEntry,
  FhirPatchPart,
  FhirPatchPathPart,
  FhirPatchTypePart
} from '../interfaces/fhirpatch.interface';
import cleanDeep from 'clean-deep';

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
  if (extractedResource.resourceType === 'Parameters') {
    // Pre-filter step: Clean extracted and comparison resource
    // This ensures that we don't have empty operation entries that would pass the comparison check below and should be filtered out
    extractedResource = cleanDeep(extractedResource, {
      emptyObjects: true,
      emptyArrays: true,
      nullValues: true,
      undefinedValues: true
    }) as Parameters;

    comparisonResource = cleanDeep(comparisonResource, {
      emptyObjects: true,
      emptyArrays: true,
      nullValues: true,
      undefinedValues: true
    }) as FhirResource | null;

    if (!parametersIsFhirPatch(extractedResource)) {
      // If the extracted resource is not a valid FHIRPatch Parameters resource after cleaning, skip it
      return null;
    }

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

// Type predicate to check if a FHIRPatch part is a value part
function isValuePart(
  part: FhirPatchPart | undefined
): part is { [key: string]: unknown; name: 'value' } {
  return part?.name === 'value';
}

// Filter out entries where the value[x] is empty
function filterFhirPatchEmptyValues(
  fhirPatchParameterEntries: FhirPatchParameterEntry[]
): FhirPatchParameterEntry[] {
  return fhirPatchParameterEntries.filter((param) => {
    const valuePart = param.part?.find((part) => part.name === 'value');
    return isValuePart(valuePart) && !fhirPatchValueIsEmpty(valuePart); // keep only if value is NOT empty
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

/**
 * Extracts the type, path, and optional name parts from a FHIRPatch parameter entry.
 */
function extractFhirPatchParameterEntryParts(entry: FhirPatchParameterEntry) {
  const typePart = entry.part.find((p) => isFhirPatchTypePart(p)) as FhirPatchTypePart | undefined;
  const pathPart = entry.part.find((p) => isFhirPatchPathPart(p)) as FhirPatchPathPart | undefined;
  const namePart = entry.part.find((p) => isFhirPatchNamePart(p)) as FhirPatchPathPart | undefined;

  return { typePart, pathPart, namePart };
}

/**
 * Builds a unique key for a FHIR Patch operation using its type, path,
 * and optional name parts.
 */
function createFhirPatchKey(
  typePart: FhirPatchTypePart,
  pathPart: FhirPatchPathPart,
  namePart?: FhirPatchPathPart
): string {
  let key = `${typePart.valueCode}-${pathPart.valueString}`;
  if (namePart) {
    key += `-${namePart.valueString}`;
  }

  return key;
}

function filterFhirPatchChangedOperations(
  extractedEntries: FhirPatchParameterEntry[],
  comparisonEntries: FhirPatchParameterEntry[]
): FhirPatchParameterEntry[] {
  // Build a map of comparison operations keyed by {type}-{path}
  // Use a map instead of using indexes because some empty operations might be filtered out in filterFhirPatchEmptyValues previously, resulting in un-aligned indexes
  const comparisonMap = new Map<string, FhirPatchParameterEntry>(
    comparisonEntries
      .map((entry) => {
        const { typePart, pathPart, namePart } = extractFhirPatchParameterEntryParts(entry);
        if (!typePart || !pathPart) {
          return null;
        }

        const key = createFhirPatchKey(typePart, pathPart, namePart);
        return [key, entry] as const;
      })
      .filter((x): x is [string, FhirPatchParameterEntry] => x !== null)
  );

  const operationsToRetain: FhirPatchParameterEntry[] = [];
  for (const extractedOperation of extractedEntries) {
    if (!extractedOperation) {
      continue; // Skip if extractedOperation is missing
    }

    const { typePart, pathPart, namePart } =
      extractFhirPatchParameterEntryParts(extractedOperation);
    if (!typePart || !pathPart) {
      // If we can't build the key, just keep it - as a conservative decision
      operationsToRetain.push(extractedOperation);
      continue;
    }

    const key = createFhirPatchKey(typePart, pathPart, namePart);
    const comparisonOperation = comparisonMap.get(key);

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
