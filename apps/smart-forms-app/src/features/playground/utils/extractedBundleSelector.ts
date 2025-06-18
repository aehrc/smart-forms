import type { FhirResource } from 'fhir/r4';
import { constructName } from '../../smartAppLaunch/utils/launchContext.ts';
import type { FhirPatchParameterEntry } from '@aehrc/sdc-template-extract';
import { parametersIsFhirPatch } from '@aehrc/sdc-template-extract';

export function getMethodLabel(method: string): string {
  switch (method) {
    case 'POST':
      return 'New';
    case 'PUT':
      return 'Update';
    case 'PATCH':
      return 'Update';
    default:
      return method;
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
    return `${encounterClass?.display || 'Encounter'} (${resource.status})`;
  }

  if (resource.resourceType === 'Condition') {
    const conditionCode = resource.code;
    return conditionCode?.coding?.[0]?.display || conditionCode?.text || 'Condition';
  }

  if (resource.resourceType === 'MedicationStatement') {
    const medicationCode = resource.medicationCodeableConcept;
    return medicationCode?.coding?.[0]?.display || medicationCode?.text || 'Medication Statement';
  }

  if (resource.resourceType === 'AllergyIntolerance') {
    const allergyCode = resource.code;
    return allergyCode?.coding?.[0]?.display || allergyCode?.text || 'Allergy Intolerance';
  }

  if (resource.resourceType === 'Procedure') {
    const procedureCode = resource.code;
    return procedureCode?.coding?.[0]?.display || procedureCode?.text || 'Procedure';
  }

  if (resource.resourceType === 'Immunization') {
    const vaccineCode = resource.vaccineCode;
    return vaccineCode?.coding?.[0]?.display || vaccineCode?.text || 'Immunization';
  }

  if (resource.resourceType === 'Observation') {
    const observationCode = resource.code;
    return observationCode?.coding?.[0]?.display || observationCode?.text || 'Observation';
  }

  // Fallback to resourceType if no specific display is available
  return `${resource.resourceType} (Not implemented)`;
}

export function getFhirPatchParametersDisplays(
  resource: FhirResource,
  resourceType: FhirResource['resourceType']
): string[] {
  if (!resource || !resource.resourceType) {
    return [];
  }

  if (resource.resourceType === 'Parameters' && parametersIsFhirPatch(resource)) {
    const fhirPatchParameterEntries = resource.parameter as FhirPatchParameterEntry[] | undefined;
    const operations = fhirPatchParameterEntries?.filter(
      (parameter) => parameter.name === 'operation'
    );
    if (!operations || operations.length === 0) {
      return [];
    }

    const operationDisplays = operations.map((operation) =>
      getFhirPatchOperationDisplay(operation, resourceType)
    );

    console.log(operationDisplays);
    return operationDisplays;
  }

  return [];
}

function getFhirPatchOperationDisplay(
  operation: FhirPatchParameterEntry,
  resourceType: FhirResource['resourceType']
): string {
  const path = operation.part.find((part) => part.name === 'path')?.valueString;
  const fieldName = operation.part.find((part) => part.name === 'name')?.valueString;
  const valuePart = operation.part.find((part) => part.name === 'value');

  if (!valuePart) {
    return `FHIRPatch for ${resourceType}`;
  }

  const valueKey = Object.keys(valuePart).find((k) => k.startsWith('value') && k !== 'value');
  if (!valueKey) {
    return `FHIRPatch for ${resourceType}`;
  }

  const valueType = valueKey.replace('value', '').toLowerCase();
  const operationDisplay = `${resourceType} at ${path || ''} ${fieldName ? `(${fieldName})` : ''} ${valueType ?? ''}`;

  return operationDisplay;
}
