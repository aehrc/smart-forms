import type { BundleEntry, BundleEntryRequest, FhirResource } from 'fhir/r4';
import { constructName } from '../../smartAppLaunch/utils/launchContext.ts';
import type { FhirPatchParameterEntry } from '@aehrc/sdc-template-extract';
import { parametersIsFhirPatch } from '@aehrc/sdc-template-extract';

/**
 * Creates a unique selection key for a bundle entry or its operation for WriteBackSelector.
 */
export function createSelectionKey(bundleEntryIndex: number, operationEntryIndex?: number): string {
  return typeof operationEntryIndex === 'number'
    ? `bundle-${bundleEntryIndex}-operation-${operationEntryIndex}`
    : `bundle-${bundleEntryIndex}`;
}

/**
 * Counts how many operations within a bundle entry are selected vs. valid for WriteBackSelector.
 */
export function getOperationEntryCounts(
  bundleEntryIndex: number,
  selectedEntries: Set<string>,
  allValidEntries: Set<string>
): { numOfSelectedOperations: number; numOfValidOperations: number } {
  const operationPrefix = `bundle-${bundleEntryIndex}-operation-`;

  const numOfSelectedOperations = Array.from(selectedEntries).filter((key) =>
    key.startsWith(operationPrefix)
  ).length;

  const numOfValidOperations = Array.from(allValidEntries).filter((key) =>
    key.startsWith(operationPrefix)
  ).length;

  return { numOfSelectedOperations, numOfValidOperations };
}

/**
 * Returns a set of valid selection keys for bundle entries and FHIRPatch operations for WriteBackSelector.
 *
 * Exclude entries with these three criteria:
 * 1. BundleEntry no resource or request
 * 2. BundleEntry resource is a Parameters resource but is not a valid FHIRPatch
 * 3. BundleEntry resource is a FHIRPatch but has no "type", "path" or "value" in the operation parts
 */
export function getValidEntries(bundleEntries: BundleEntry[]): Set<string> {
  const validEntries: Set<string> = new Set();

  for (const [bundleEntryIndex, bundleEntry] of bundleEntries.entries()) {
    // 1. Skip if the entry doesn't have a resource and request
    if (!bundleEntry.resource || !bundleEntry.request) {
      continue;
    }

    const resource = bundleEntry.resource;
    if (resource.resourceType === 'Parameters') {
      // 2. Skip if the resource is a Parameters resource but is not a valid FHIRPatch
      if (!parametersIsFhirPatch(resource)) {
        continue;
      }

      for (const [operationEntryIndex, operation] of resource.parameter.entries()) {
        const {
          type: operationType,
          path: operationPath,
          valuePart: operationValuePart
        } = getFhirPatchOperationParts(operation);

        // 3. Skip if the resource is a FHIRPatch but has no "type", "path" or "value" in the operation parts
        if (!operationType || !operationPath || !operationValuePart) {
          continue;
        }

        // Add FHIRPatch operations that pass the initial selection criteria
        validEntries.add(createSelectionKey(bundleEntryIndex, operationEntryIndex));
      }
    } else {
      // Add non-FHIRPatch resources that pass the initial selection criteria
      validEntries.add(createSelectionKey(bundleEntryIndex));
    }
  }

  return validEntries;
}

/**
 * Returns a set of all bundle entry and operation keys from the bundle, without exclusions.
 * This is more for the dialog that contains WriteBackSelector, since most likely the bundle is already filtered by the user.
 *
 * - Includes all bundle entries that have a resource.
 * - If the resource is a Parameters (FHIRPatch), includes all its operations.
 */
export function getAllEntries(bundleEntries: BundleEntry[]): Set<string> {
  const allEntries: Set<string> = new Set();

  for (const [bundleEntryIndex, bundleEntry] of bundleEntries.entries()) {
    const resource = bundleEntry.resource;

    if (!resource) {
      continue;
    }

    if (resource.resourceType === 'Parameters' && Array.isArray(resource.parameter)) {
      for (const [operationEntryIndex] of resource.parameter.entries()) {
        allEntries.add(createSelectionKey(bundleEntryIndex, operationEntryIndex));
      }
    } else {
      allEntries.add(createSelectionKey(bundleEntryIndex));
    }
  }

  return allEntries;
}

/**
 * Filters the bundle entries to include only selected resources and operations for WriteBackSelector.
 *
 * - For FHIRPatch (Parameters) entries: includes only selected operations.
 * - For non-FHIRPatch resources: includes the entry if its key is selected.
 * - Skips entries without a resource.
 */
export function getFilteredBundleEntries(
  selectedEntries: Set<string>,
  allBundleEntries: BundleEntry[]
): BundleEntry[] {
  const filteredBundleEntries: BundleEntry[] = [];

  for (const [bundleEntryIndex, entry] of allBundleEntries.entries()) {
    const resource = entry.resource;

    // Skip if no resource
    if (!resource) {
      continue;
    }

    // FHIRPatch: filter its operations
    if (resource.resourceType === 'Parameters' && parametersIsFhirPatch(resource)) {
      const selectedOperations = resource.parameter
        .map((operation, operationEntryIndex) => ({
          operation,
          key: createSelectionKey(bundleEntryIndex, operationEntryIndex)
        }))
        .filter(({ key }) => selectedEntries.has(key))
        .map(({ operation }) => operation) as FhirPatchParameterEntry[];

      if (selectedOperations.length > 0) {
        filteredBundleEntries.push({
          ...entry,
          resource: {
            ...resource,
            parameter: selectedOperations
          }
        });
      }

      continue;
    }

    // Non-FHIRPatch: include only if the entry itself is valid
    const key = createSelectionKey(bundleEntryIndex);
    if (selectedEntries.has(key)) {
      filteredBundleEntries.push(entry);
    }
  }

  return filteredBundleEntries;
}

export function getChipMethodDetails(method: string): {
  label: string;
  colorVariant: 'primary' | 'secondary';
} {
  switch (method) {
    case 'POST':
      return { label: 'new', colorVariant: 'secondary' };
    case 'PUT':
      return { label: 'update', colorVariant: 'primary' };
    case 'PATCH':
      return { label: 'update', colorVariant: 'primary' };
    default:
      return { label: method, colorVariant: 'primary' };
  }
}

// Not exhaustive, but covers common resource types
// - Patient
// - Encounter
// - Condition
// - MedicationStatement
// - AllergyIntolerance
// - Procedure
// - Immunization
// - Observation
// - FHIRPatch Parameters
export function getResourceDisplay(resource: FhirResource) {
  if (!resource || !resource.resourceType) {
    return 'Unknown Resource';
  }

  if (resource.resourceType === 'Patient') {
    const humanName = resource.name;
    return humanName ? constructName(humanName) : 'Unnamed Patient';
  }

  if (resource.resourceType === 'Encounter') {
    const encounterClass = resource.class;
    return `${encounterClass?.display || 'Unknown'} (${resource.status})`;
  }

  if (resource.resourceType === 'Condition') {
    // https://build.fhir.org/ig/hl7au/au-fhir-core/StructureDefinition-au-core-condition.html - Condition.code 1..1
    const conditionCode = resource.code;
    return conditionCode?.coding?.[0]?.display || conditionCode?.text || 'Unknown';
  }

  if (resource.resourceType === 'MedicationStatement') {
    const medicationCode = resource.medicationCodeableConcept;
    return medicationCode?.coding?.[0]?.display || medicationCode?.text || 'Unknown';
  }

  if (resource.resourceType === 'AllergyIntolerance') {
    // https://build.fhir.org/ig/hl7au/au-fhir-core/StructureDefinition-au-core-allergyintolerance.html - AllergyIntolerance.code 1..1
    const allergyCode = resource.code;
    return allergyCode?.coding?.[0]?.display || allergyCode?.text || 'Unknown';
  }

  if (resource.resourceType === 'Procedure') {
    const procedureCode = resource.code;
    return procedureCode?.coding?.[0]?.display || procedureCode?.text || 'Unknown';
  }

  if (resource.resourceType === 'Immunization') {
    const vaccineCode = resource.vaccineCode;
    return vaccineCode?.coding?.[0]?.display || vaccineCode?.text || 'Unknown';
  }

  if (resource.resourceType === 'Observation') {
    // (Example observation) https://build.fhir.org/ig/hl7au/au-fhir-core/StructureDefinition-au-core-bloodpressure.html - Observation.code 1..1
    const observationCode = resource.code;
    return observationCode?.coding?.[0]?.display || observationCode?.text || 'Unknown';
  }

  // Fallback to resourceType if no specific display is available
  return `${resource.resourceType}`;
}

export function getFhirPatchResourceDisplay(
  bundleRequest: BundleEntryRequest,
  populatedResourceMap: Map<string, FhirResource>
): string {
  const resourceType = bundleRequest.url.split('/')[0] as FhirResource['resourceType'];
  const resourceId = bundleRequest.url.split('/')[1];

  if (!resourceType || !resourceId) {
    return 'Unknown';
  }

  const populatedResource = populatedResourceMap.get(resourceId);
  if (populatedResource) {
    return getResourceDisplay(populatedResource);
  }

  return `Unknown`;
}

export function getFhirPatchOperationParts(operation: FhirPatchParameterEntry): {
  type?: string;
  path?: string;
  name?: string;
  valuePart?: { [key: string]: any };
  index?: number;
  source?: number;
  destination?: number;
} {
  const type = operation.part.find((part) => part.name === 'type')?.valueCode;
  const path = operation.part.find((part) => part.name === 'path')?.valueString;
  const name = operation.part.find((part) => part.name === 'name')?.valueString;
  const valuePart = operation.part.find((part) => part.name === 'value');
  const index = operation.part.find((part) => part.name === 'index')?.valueInteger;
  const source = operation.part.find((part) => part.name === 'source')?.valueInteger;
  const destination = operation.part.find((part) => part.name === 'destination')?.valueInteger;

  return {
    type,
    path,
    name,
    valuePart,
    index,
    source,
    destination
  };
}

export function getFhirPatchOperationPathDisplay(
  operationPath: string | undefined,
  operationName: string | undefined
): string {
  if (!operationPath) {
    return '';
  }

  if (!operationName) {
    return operationPath;
  }

  // If operationName is the last segment of the path e.g. name = "clinicalStatus" and path = "Condition.clinicalStatus"
  const pathLastSegment = operationPath.split('.').pop() || '';
  if (operationName === pathLastSegment) {
    return operationPath;
  }

  return operationName + ' ' + pathLastSegment;
}

export function getPopulatedResourceMap(populatedContext: Record<string, any>) {
  const populatedResourceMap: Map<string, FhirResource> = new Map();
  for (const value of Object.values(populatedContext)) {
    if (value && value.entry) {
      value.entry.forEach((entry: { resource: FhirResource }) => {
        if (entry.resource && entry.resource.id) {
          populatedResourceMap.set(entry.resource.id, entry.resource);
        }
      });
    }
  }

  return populatedResourceMap;
}
