import type { BundleEntry, BundleEntryRequest, FhirResource, ParametersParameter } from 'fhir/r4';
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
export function getEntriesValidKeys(bundleEntries: BundleEntry[]): Set<string> {
  const validKeys: Set<string> = new Set();

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
        validKeys.add(createSelectionKey(bundleEntryIndex, operationEntryIndex));
      }
    } else {
      // Add non-FHIRPatch resources that pass the initial selection criteria
      validKeys.add(createSelectionKey(bundleEntryIndex));
    }
  }

  return validKeys;
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
  pathLabel?: string;
} {
  const type = operation.part.find((part) => part.name === 'type')?.valueCode;
  const path = operation.part.find((part) => part.name === 'path')?.valueString;
  const name = operation.part.find((part) => part.name === 'name')?.valueString;
  const valuePart = operation.part.find((part) => part.name === 'value');
  const index = operation.part.find((part) => part.name === 'index')?.valueInteger;
  const source = operation.part.find((part) => part.name === 'source')?.valueInteger;
  const destination = operation.part.find((part) => part.name === 'destination')?.valueInteger;

  // Custom "pathLabel" for a human-readable label of the path
  const pathLabel = (operation as ParametersParameter).part?.find(
    (part) => part.name === 'pathLabel'
  )?.valueString;

  return {
    type,
    path,
    name,
    valuePart,
    index,
    source,
    destination,
    pathLabel
  };
}

// Fallback if pathLabel is not available
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

const primitiveDataTypes = [
  'valueBase64Binary',
  'valueBoolean',
  'valueCode',
  'valueDate',
  'valueDateTime',
  'valueDecimal',
  'valueId',
  'valueInstant',
  'valueInteger',
  'valueInteger64',
  'valueMarkdown',
  'valueOid',
  'valuePositiveInt',
  'valueString',
  'valueTime',
  'valueUnsignedInt',
  'valueUri',
  'valueUrl',
  'valueUuid'
];

// This can probably be moved to a shared utility file since it generally generates display strings for FHIR datatypes.
export function getFhirPatchOperationValueDisplay(
  operationValuePart: { [key: string]: any } | undefined
): string {
  if (!operationValuePart) {
    return '';
  }

  const valueKey = Object.keys(operationValuePart).find((k) => k.startsWith('value'));
  const valueObj = operationValuePart[valueKey ?? ''];
  if (valueKey && valueObj) {
    // 1. Handle primitive data types
    if (primitiveDataTypes.includes(valueKey)) {
      return String(valueObj);
    }

    // 2. Handle CodeableConcept
    if (valueKey === 'valueCodeableConcept') {
      if (valueObj?.coding?.[0]?.display) {
        return valueObj.coding[0].display;
      }

      if (valueObj?.text) {
        return valueObj.text;
      }

      if (valueObj?.coding?.[0]?.code) {
        return valueObj.coding[0].code;
      }
    }

    // 3. Handle Coding
    if (valueKey === 'valueCoding') {
      if (valueObj?.display) {
        return valueObj.display;
      }

      if (valueObj?.code) {
        return valueObj.code;
      }
    }

    // 4. Handle Reference
    if (valueKey === 'valueReference') {
      if (valueObj?.display) {
        return valueObj.display;
      }

      if (valueObj?.reference) {
        return valueObj.reference;
      }
    }

    // 5. Handle Quantity, Money, Count, Age, Distance, Duration
    if (
      [
        'valueQuantity',
        'valueMoney',
        'valueCount',
        'valueAge',
        'valueDistance',
        'valueDuration'
      ].includes(valueKey)
    ) {
      // Display as "value unit" (e.g., "5 mg")
      const val = valueObj.value !== undefined ? valueObj.value : '';
      const unit = valueObj.unit || valueObj.code || '';
      return [val, unit].filter(Boolean).join(' ');
    }

    // 6. Handle HumanName
    if (valueKey === 'valueHumanName') {
      return constructName(valueObj);
    }

    // 7. Handle Address
    if (valueKey === 'valueAddress') {
      const lines = [
        ...(valueObj.line || []),
        valueObj.city,
        valueObj.state,
        valueObj.postalCode,
        valueObj.country
      ].filter(Boolean);
      return lines.join(', ');
    }

    // 8. Handle Period
    if (valueKey === 'valuePeriod') {
      return `${valueObj.start || ''} – ${valueObj.end || ''}`.trim();
    }

    // 9. Handle Range
    if (valueKey === 'valueRange') {
      const low = valueObj.low ? `${valueObj.low.value} ${valueObj.low.unit || ''}` : '';
      const high = valueObj.high ? `${valueObj.high.value} ${valueObj.high.unit || ''}` : '';
      return [low, high].filter(Boolean).join(' – ');
    }

    // 10. Handle Ratio
    if (valueKey === 'valueRatio') {
      const num = valueObj.numerator
        ? `${valueObj.numerator.value} ${valueObj.numerator.unit || ''}`.trim()
        : '';
      const denom = valueObj.denominator
        ? `${valueObj.denominator.value} ${valueObj.denominator.unit || ''}`.trim()
        : '';
      return num && denom ? `${num} / ${denom}` : num || denom;
    }

    // 11. Handle Attachment
    if (valueKey === 'valueAttachment') {
      return valueObj.title || valueObj.url || valueObj.contentType || 'Attachment';
    }

    // 12. Handle Identifier
    if (valueKey === 'valueIdentifier') {
      return [valueObj.system, valueObj.value].filter(Boolean).join(' | ');
    }

    // 13. Handle ContactPoint
    if (valueKey === 'valueContactPoint') {
      return [valueObj.system, valueObj.value].filter(Boolean).join(': ');
    }

    // 14. Handle Annotation
    if (valueKey === 'valueAnnotation') {
      return valueObj.text || JSON.stringify(valueObj);
    }

    // 15. Handle Timing
    if (valueKey === 'valueTiming') {
      return valueObj.code?.text || valueObj.repeat?.frequency || 'Timing';
    }

    // 16. Handle SampledData
    if (valueKey === 'valueSampledData') {
      return `SampledData: ${valueObj.data?.slice(0, 20)}...`;
    }

    // 17. Handle Meta
    if (valueKey === 'valueMeta') {
      return valueObj.versionId || valueObj.lastUpdated || 'Meta';
    }

    // Otherwise, return the JSON stringified value
    return JSON.stringify(operationValuePart, null, 2);
  }

  return '';
}

/**
 * Extracts and flattens FHIR resources from a populated context into a Map, keyed by their resource `id`.
 * Support downstream functions like getFhirPatchResourceDisplay().
 *
 * This function supports both individual FHIR resources and Bundles. If the
 * context value is a single FHIR resource (not a Bundle), it is added directly
 * to the map. If it is a Bundle, each `entry.resource` is added individually.
 *
 */
export function getPopulatedResourceMap(populatedContext: Record<string, any>) {
  const populatedResourceMap: Map<string, FhirResource> = new Map();
  for (const value of Object.values(populatedContext)) {
    if (value && value.resourceType) {
      // Save resource directly if it's not a Bundle
      if (value.resourceType !== 'Bundle' && value.id) {
        populatedResourceMap.set(value.id, value as FhirResource);
        continue;
      }

      // If resource is a Bundle, save each entry resource individually
      if (value && value.resourceType === 'Bundle' && value.entry) {
        value.entry.forEach((entry: BundleEntry) => {
          if (entry.resource && entry.resource.id) {
            populatedResourceMap.set(entry.resource.id, entry.resource);
          }
        });
      }
    }
  }

  return populatedResourceMap;
}
