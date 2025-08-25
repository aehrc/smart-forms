/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { describe, expect, it } from '@jest/globals';
import {
  createSelectionKey,
  getEntriesValidKeys,
  getFilteredBundleEntries,
  getOperationEntryCounts,
  getChipMethodDetails,
  getResourceDisplay,
  getFhirPatchResourceDisplay,
  getFhirPatchOperationParts,
  getFhirPatchOperationPathDisplay,
  getFhirPatchOperationValueDisplay,
  getPopulatedResourceMap
} from '../utils/extractedBundleSelector.ts';
import { randomBundleEntries } from '../../../test/data-shared/randomBundleEntries.ts';
import { extractedMedicalHistoryCurrentProblemsWithPatch } from '../../../test/data-shared/extractedMedicalHistoryCurrentProblemsWithPatch.ts';
import type { FhirPatchParameters, FhirPatchParameterEntry } from '@aehrc/sdc-template-extract';

describe('createSelectionKey', () => {
  it('creates bundle entry key correctly', () => {
    expect(createSelectionKey(0)).toBe('bundle-0');
    expect(createSelectionKey(5)).toBe('bundle-5');
  });

  it('creates operation entry key correctly', () => {
    expect(createSelectionKey(0, 1)).toBe('bundle-0-operation-1');
    expect(createSelectionKey(3, 2)).toBe('bundle-3-operation-2');
  });
});

describe('getOperationEntryCounts', () => {
  const totalValidEntries = new Set<string>([
    'bundle-1',
    'bundle-2',
    'bundle-3',
    'bundle-6-operation-0',
    'bundle-7-operation-0',
    'bundle-8-operation-0',
    'bundle-8-operation-1',
    'bundle-9-operation-0',
    'bundle-9-operation-1'
  ]);

  it('returns 0 selected, 0 valid for bundle without operations (e.g. bundle-1)', () => {
    const selectedEntries = new Set<string>(['bundle-1']);
    const result = getOperationEntryCounts(1, selectedEntries, totalValidEntries);
    expect(result).toEqual({ numOfSelectedOperations: 0, numOfValidOperations: 0 });
  });

  it('returns 1 selected, 1 valid for bundle-6 with only one operation selected', () => {
    const selectedEntries = new Set<string>(['bundle-6-operation-1']);
    const result = getOperationEntryCounts(6, selectedEntries, totalValidEntries);
    expect(result).toEqual({ numOfSelectedOperations: 1, numOfValidOperations: 1 });
  });

  it('returns 1 selected, 2 valid for bundle-8 with one of two operations selected', () => {
    const selectedEntries = new Set<string>(['bundle-8-operation-0']);
    const result = getOperationEntryCounts(8, selectedEntries, totalValidEntries);
    expect(result).toEqual({ numOfSelectedOperations: 1, numOfValidOperations: 2 });
  });

  it('returns 2 selected, 2 valid for bundle-9 with all operations selected', () => {
    const selectedEntries = new Set<string>(['bundle-9-operation-0', 'bundle-9-operation-1']);
    const result = getOperationEntryCounts(9, selectedEntries, totalValidEntries);
    expect(result).toEqual({ numOfSelectedOperations: 2, numOfValidOperations: 2 });
  });

  it('returns 0 selected, 1 valid for bundle-7 with no selections', () => {
    const selectedEntries = new Set<string>();
    const result = getOperationEntryCounts(7, selectedEntries, totalValidEntries);
    expect(result).toEqual({ numOfSelectedOperations: 0, numOfValidOperations: 1 });
  });

  it('ignores unrelated selections when checking bundle-7', () => {
    const selectedEntries = new Set<string>(['bundle-6-operation-1']);
    const result = getOperationEntryCounts(7, selectedEntries, totalValidEntries);
    expect(result).toEqual({ numOfSelectedOperations: 0, numOfValidOperations: 1 });
  });
});

describe('getValidEntries', () => {
  it('includes only valid bundle entries based on inclusion criteria', () => {
    const patchBundleEntries = extractedMedicalHistoryCurrentProblemsWithPatch.entry ?? [];
    const result = getEntriesValidKeys([...randomBundleEntries, ...patchBundleEntries]);

    expect(result).toEqual(
      new Set([
        'bundle-1',
        'bundle-2',
        'bundle-3',
        'bundle-6-operation-0',
        'bundle-7-operation-0',
        'bundle-8-operation-0',
        'bundle-8-operation-1',
        'bundle-9-operation-0',
        'bundle-9-operation-1'
      ])
    );
  });
});

describe('getFilteredBundleEntries', () => {
  const patchBundleEntries = extractedMedicalHistoryCurrentProblemsWithPatch.entry ?? [];
  const allBundleEntries = [...randomBundleEntries, ...patchBundleEntries];
  const validKeys = getEntriesValidKeys(allBundleEntries);

  it('returns all entries and operations when all valid entries are selected', () => {
    const result = getFilteredBundleEntries(validKeys, allBundleEntries);

    // Check total count roughly matches non-empty filtered entries (some ops removed)
    expect(result.length).toBeGreaterThan(0);

    // Check key resource types and IDs exist at expected bundle indexes
    // Using known data from your bundleEntries:
    expect(result[0].resource?.resourceType).toBe('Patient');
    expect(result[0].resource?.id).toBe('patient-123');

    expect(result[1].resource?.resourceType).toBe('Patient');
    expect(result[1].resource?.id).toBe('456');

    expect(result[2].resource?.resourceType).toBe('Observation');

    // For FHIRPatch entry at bundle index 6
    const fhirPatchEntry6 = result.find(
      (entry) =>
        entry.resource?.resourceType === 'Parameters' &&
        entry.request?.url === 'Condition/ckd-pat-sf'
    );
    expect(fhirPatchEntry6).toBeDefined();
    const fhirPatchEntry6Resource = fhirPatchEntry6?.resource as FhirPatchParameters;
    expect(fhirPatchEntry6Resource?.parameter?.length).toBe(1);
    const fhirPatchEntry6Operation0 = fhirPatchEntry6Resource?.parameter?.[0]?.part;
    expect(fhirPatchEntry6Operation0).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'type', valueCode: 'replace' }),
        expect.objectContaining({ name: 'path', valueString: 'Condition.clinicalStatus' }),
        expect.objectContaining({ name: 'name', valueString: 'clinicalStatus' }),
        expect.objectContaining({ name: 'value', valueCodeableConcept: expect.any(Object) })
      ])
    );

    // Similarly check bundle index 8 with two operations
    const fhirPatchEntry8 = result.find(
      (entry) =>
        entry.resource?.resourceType === 'Parameters' &&
        entry.request?.url === 'Condition/uti-pat-sf'
    );
    expect(fhirPatchEntry8).toBeDefined();
    const fhirPatchEntry8Resource = fhirPatchEntry8?.resource as FhirPatchParameters;
    expect(fhirPatchEntry8Resource?.parameter?.length).toBe(2);

    // Check first operation has 'type' and 'path' fields correctly
    const fhirPatchEntry8OperationClinicalStatus = fhirPatchEntry8Resource?.parameter?.[0]?.part;
    expect(fhirPatchEntry8OperationClinicalStatus).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'type', valueCode: 'replace' }),
        expect.objectContaining({ name: 'path', valueString: 'Condition.clinicalStatus' }),
        expect.objectContaining({ name: 'name', valueString: 'clinicalStatus' }),
        expect.objectContaining({ name: 'value', valueCodeableConcept: expect.any(Object) })
      ])
    );

    const fhirPatchEntry8OperationAbatement = fhirPatchEntry8Resource?.parameter?.[1]?.part;
    expect(fhirPatchEntry8OperationAbatement).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'type', valueCode: 'replace' }),
        expect.objectContaining({ name: 'path', valueString: 'Condition.abatement' }),
        expect.objectContaining({ name: 'name', valueString: 'abatement' }),
        expect.objectContaining({ name: 'value', valueDateTime: expect.any(String) })
      ])
    );
  });

  it('returns only selected entries and operations when selection is a subset', () => {
    const selectedEntries = new Set<string>([
      // Select non-FHIRPatch bundle entries by index
      createSelectionKey(2), // Patient with id '456'

      // Select some operations within a FHIRPatch bundle entry
      createSelectionKey(6, 0), // Operation 0 in bundle 6 (Condition/ckd-pat-sf)
      createSelectionKey(8, 1) // Operation 1 in bundle 8 (Condition/uti-pat-sf)
    ]);

    const result = getFilteredBundleEntries(selectedEntries, allBundleEntries);

    // Expect result length matches the selected entries count (some are operations)
    expect(result.length).toBe(3);

    // Check Patient entry included, with correct ID
    const patient2 = result.find((e) => e.resource?.id === '456');
    expect(patient2).toBeDefined();
    expect(patient2?.resource?.resourceType).toBe('Patient');

    // Check the FHIRPatch entry at bundle 6 with exactly 1 operation (0th operation) included
    const fhirPatchEntry6 = result.find(
      (e) => e.resource?.resourceType === 'Parameters' && e.request?.url === 'Condition/ckd-pat-sf'
    );
    expect(fhirPatchEntry6).toBeDefined();
    const fhirPatchEntry6Resource = fhirPatchEntry6?.resource as FhirPatchParameters;
    expect(fhirPatchEntry6Resource?.parameter?.length).toBe(1);

    // Check operation 0 parts (replace clinicalStatus)
    const fhirPatchEntry6OperationClinicalStatus = fhirPatchEntry6Resource?.parameter?.[0]?.part;
    expect(fhirPatchEntry6OperationClinicalStatus).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'type', valueCode: 'replace' }),
        expect.objectContaining({ name: 'path', valueString: 'Condition.clinicalStatus' }),
        expect.objectContaining({ name: 'value', valueCodeableConcept: expect.any(Object) })
      ])
    );

    // Check the FHIRPatch entry at bundle 8 with exactly 1 operation (1st operation) included
    const fhirPatchEntry8 = result.find(
      (e) => e.resource?.resourceType === 'Parameters' && e.request?.url === 'Condition/uti-pat-sf'
    );
    expect(fhirPatchEntry8).toBeDefined();
    const fhirPatchEntry8Resource = fhirPatchEntry8?.resource as FhirPatchParameters;
    expect(fhirPatchEntry8Resource?.parameter?.length).toBe(1);

    // Check operation 1 parts (replace abatement)
    const fhirPatchEntry8OperationAbatement = fhirPatchEntry8Resource?.parameter?.[0]?.part;
    expect(fhirPatchEntry8OperationAbatement).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'type', valueCode: 'replace' }),
        expect.objectContaining({ name: 'path', valueString: 'Condition.abatement' }),
        expect.objectContaining({ name: 'value', valueDateTime: expect.any(String) })
      ])
    );
  });

  it('returns empty array when no entries are selected', () => {
    const selectedEntries = new Set<string>(); // nothing selected
    const result = getFilteredBundleEntries(selectedEntries, allBundleEntries);
    expect(result).toEqual([]);
  });
});

describe('getChipMethodDetails', () => {
  it('returns correct details for POST method', () => {
    const result = getChipMethodDetails('POST');
    expect(result).toEqual({ label: 'new', colorVariant: 'secondary' });
  });

  it('returns correct details for PUT method', () => {
    const result = getChipMethodDetails('PUT');
    expect(result).toEqual({ label: 'update', colorVariant: 'primary' });
  });

  it('returns correct details for PATCH method', () => {
    const result = getChipMethodDetails('PATCH');
    expect(result).toEqual({ label: 'update', colorVariant: 'primary' });
  });

  it('returns default details for unknown method', () => {
    const result = getChipMethodDetails('DELETE');
    expect(result).toEqual({ label: 'DELETE', colorVariant: 'primary' });
  });

  it('returns default details for empty method', () => {
    const result = getChipMethodDetails('');
    expect(result).toEqual({ label: '', colorVariant: 'primary' });
  });
});

describe('getResourceDisplay', () => {
  it('returns "Unknown Resource" for null resource', () => {
    expect(getResourceDisplay(null as any)).toBe('Unknown Resource');
  });

  it('returns "Unknown Resource" for resource without resourceType', () => {
    expect(getResourceDisplay({} as any)).toBe('Unknown Resource');
  });

  it('handles Patient resource with name', () => {
    const patient = {
      resourceType: 'Patient' as const,
      id: 'patient-1',
      name: [
        {
          family: 'Smith',
          given: ['John']
        }
      ]
    };
    const result = getResourceDisplay(patient as any);
    expect(result).toBe('John Smith');
  });

  it('handles Patient resource without name', () => {
    const patient = {
      resourceType: 'Patient' as const,
      id: 'patient-1'
    };
    const result = getResourceDisplay(patient as any);
    expect(result).toBe('Unnamed Patient');
  });

  it('handles Encounter resource', () => {
    const encounter = {
      resourceType: 'Encounter' as const,
      id: 'encounter-1',
      status: 'finished',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: 'AMB',
        display: 'ambulatory'
      }
    };
    const result = getResourceDisplay(encounter as any);
    expect(result).toBe('ambulatory (finished)');
  });

  it('handles Encounter resource without class display', () => {
    const encounter = {
      resourceType: 'Encounter' as const,
      id: 'encounter-1',
      status: 'in-progress',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: 'AMB'
      }
    };
    const result = getResourceDisplay(encounter as any);
    expect(result).toBe('Unknown (in-progress)');
  });

  it('handles Condition resource with coding display', () => {
    const condition = {
      resourceType: 'Condition' as const,
      id: 'condition-1',
      subject: { reference: 'Patient/123' },
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '44054006',
            display: 'Diabetes mellitus type 2'
          }
        ]
      }
    };
    const result = getResourceDisplay(condition as any);
    expect(result).toBe('Diabetes mellitus type 2');
  });

  it('handles Condition resource with text', () => {
    const condition = {
      resourceType: 'Condition' as const,
      id: 'condition-1',
      subject: { reference: 'Patient/123' },
      code: {
        text: 'High blood pressure'
      }
    };
    const result = getResourceDisplay(condition as any);
    expect(result).toBe('High blood pressure');
  });

  it('handles Condition resource with coding code only', () => {
    const condition = {
      resourceType: 'Condition' as const,
      id: 'condition-1',
      subject: { reference: 'Patient/123' },
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '44054006'
          }
        ]
      }
    };
    const result = getResourceDisplay(condition as any);
    expect(result).toBe('Unknown');
  });

  it('handles MedicationStatement resource', () => {
    const medicationStatement = {
      resourceType: 'MedicationStatement' as const,
      id: 'med-1',
      subject: { reference: 'Patient/123' },
      status: 'active',
      medicationCodeableConcept: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '387517004',
            display: 'Paracetamol'
          }
        ]
      }
    };
    const result = getResourceDisplay(medicationStatement as any);
    expect(result).toBe('Paracetamol');
  });

  it('handles AllergyIntolerance resource', () => {
    const allergy = {
      resourceType: 'AllergyIntolerance' as const,
      id: 'allergy-1',
      patient: { reference: 'Patient/patient-1' },
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '227493005',
            display: 'Cashew nuts'
          }
        ]
      }
    };
    const result = getResourceDisplay(allergy as any);
    expect(result).toBe('Cashew nuts');
  });

  it('handles Procedure resource', () => {
    const procedure = {
      resourceType: 'Procedure' as const,
      id: 'procedure-1',
      subject: { reference: 'Patient/123' },
      status: 'completed',
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '80146002',
            display: 'Appendectomy'
          }
        ]
      }
    };
    const result = getResourceDisplay(procedure as any);
    expect(result).toBe('Appendectomy');
  });

  it('handles Immunization resource', () => {
    const immunization = {
      resourceType: 'Immunization' as const,
      id: 'immunization-1',
      status: 'completed',
      vaccineCode: {
        coding: [
          {
            system: 'http://hl7.org/fhir/sid/cvx',
            code: '140',
            display: 'Influenza, seasonal, injectable, preservative free'
          }
        ]
      },
      patient: { reference: 'Patient/patient-1' },
      occurrenceDateTime: '2023-01-01'
    };
    const result = getResourceDisplay(immunization as any);
    expect(result).toBe('Influenza, seasonal, injectable, preservative free');
  });

  it('handles Observation resource', () => {
    const observation = {
      resourceType: 'Observation' as const,
      id: 'observation-1',
      status: 'final',
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '85354-9',
            display: 'Blood pressure panel with all children optional'
          }
        ]
      }
    };
    const result = getResourceDisplay(observation as any);
    expect(result).toBe('Blood pressure panel with all children optional');
  });

  it('handles unknown resource type', () => {
    const resource = {
      resourceType: 'Unknown' as any,
      id: 'unknown-1'
    };
    const result = getResourceDisplay(resource);
    expect(result).toBe('Unknown');
  });

  it('handles resource with missing code/display fields', () => {
    const condition = {
      resourceType: 'Condition' as const,
      id: 'condition-1',
      subject: { reference: 'Patient/123' },
      code: {}
    };
    const result = getResourceDisplay(condition as any);
    expect(result).toBe('Unknown');
  });
});

describe('getFhirPatchResourceDisplay', () => {
  it('returns correct display for valid bundle request with populated resource', () => {
    const bundleRequest = { url: 'Patient/patient-123', method: 'PUT' as const };
    const populatedResourceMap = new Map();
    populatedResourceMap.set('patient-123', {
      resourceType: 'Patient',
      id: 'patient-123',
      name: [{ family: 'Smith', given: ['John'] }]
    });

    const result = getFhirPatchResourceDisplay(bundleRequest, populatedResourceMap);
    expect(result).toBe('John Smith');
  });

  it('returns "Unknown" for bundle request without resource type', () => {
    const bundleRequest = { url: '/patient-123', method: 'PUT' as const };
    const populatedResourceMap = new Map();

    const result = getFhirPatchResourceDisplay(bundleRequest, populatedResourceMap);
    expect(result).toBe('Unknown');
  });

  it('returns "Unknown" for bundle request without resource id', () => {
    const bundleRequest = { url: 'Patient/', method: 'PUT' as const };
    const populatedResourceMap = new Map();

    const result = getFhirPatchResourceDisplay(bundleRequest, populatedResourceMap);
    expect(result).toBe('Unknown');
  });

  it('returns "Unknown" for missing populated resource', () => {
    const bundleRequest = { url: 'Patient/patient-999', method: 'PUT' as const };
    const populatedResourceMap = new Map();

    const result = getFhirPatchResourceDisplay(bundleRequest, populatedResourceMap);
    expect(result).toBe('Unknown');
  });

  it('handles complex resource type path', () => {
    const bundleRequest = { url: 'Condition/condition-456', method: 'PUT' as const };
    const populatedResourceMap = new Map();
    populatedResourceMap.set('condition-456', {
      resourceType: 'Condition',
      id: 'condition-456',
      code: {
        coding: [{ display: 'Diabetes' }]
      }
    });

    const result = getFhirPatchResourceDisplay(bundleRequest, populatedResourceMap);
    expect(result).toBe('Diabetes');
  });
});

describe('getFhirPatchOperationParts', () => {
  it('extracts all operation parts correctly', () => {
    const operation: FhirPatchParameterEntry = {
      name: 'operation',
      part: [
        { name: 'type', valueCode: 'replace' },
        { name: 'path', valueString: 'Condition.clinicalStatus' },
        { name: 'name', valueString: 'clinicalStatus' },
        { name: 'value', valueCodeableConcept: { text: 'active' } },
        { name: 'index', valueInteger: 0 },
        { name: 'source', valueInteger: 1 },
        { name: 'destination', valueInteger: 2 }
      ]
    };

    const result = getFhirPatchOperationParts(operation);
    expect(result).toEqual({
      type: 'replace',
      path: 'Condition.clinicalStatus',
      name: 'clinicalStatus',
      valuePart: { name: 'value', valueCodeableConcept: { text: 'active' } },
      index: 0,
      source: 1,
      destination: 2,
      pathLabel: undefined
    });
  });

  it('handles missing parts gracefully', () => {
    const operation: FhirPatchParameterEntry = {
      name: 'operation',
      part: [
        { name: 'type', valueCode: 'add' },
        { name: 'path', valueString: 'Patient.name' }
      ]
    };

    const result = getFhirPatchOperationParts(operation);
    expect(result).toEqual({
      type: 'add',
      path: 'Patient.name',
      name: undefined,
      valuePart: undefined,
      index: undefined,
      source: undefined,
      destination: undefined,
      pathLabel: undefined
    });
  });

  it('handles empty parts array', () => {
    const operation: FhirPatchParameterEntry = {
      name: 'operation',
      part: []
    };

    const result = getFhirPatchOperationParts(operation);
    expect(result).toEqual({
      type: undefined,
      path: undefined,
      name: undefined,
      valuePart: undefined,
      index: undefined,
      source: undefined,
      destination: undefined,
      pathLabel: undefined
    });
  });

  it('extracts pathLabel from nested part structure', () => {
    const operation = {
      name: 'operation',
      part: [
        { name: 'type', valueCode: 'replace' },
        { name: 'pathLabel', valueString: 'Custom Label' }
      ]
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = getFhirPatchOperationParts(operation as any);
    expect(result.pathLabel).toBe('Custom Label');
  });
});

describe('getFhirPatchOperationPathDisplay', () => {
  it('returns empty string for undefined path', () => {
    const result = getFhirPatchOperationPathDisplay(undefined, 'clinicalStatus');
    expect(result).toBe('');
  });

  it('returns path when name is undefined', () => {
    const result = getFhirPatchOperationPathDisplay('Condition.clinicalStatus', undefined);
    expect(result).toBe('Condition.clinicalStatus');
  });

  it('returns path when name equals last segment', () => {
    const result = getFhirPatchOperationPathDisplay('Condition.clinicalStatus', 'clinicalStatus');
    expect(result).toBe('Condition.clinicalStatus');
  });

  it('returns combined name and path segment when different', () => {
    const result = getFhirPatchOperationPathDisplay('Condition.clinicalStatus', 'status');
    expect(result).toBe('status clinicalStatus');
  });

  it('handles complex path with multiple segments', () => {
    const result = getFhirPatchOperationPathDisplay('Patient.name.family', 'surname');
    expect(result).toBe('surname family');
  });

  it('handles path without segments', () => {
    const result = getFhirPatchOperationPathDisplay('clinicalStatus', 'status');
    expect(result).toBe('status clinicalStatus');
  });
});

describe('getFhirPatchOperationValueDisplay', () => {
  it('returns empty string for undefined value part', () => {
    expect(getFhirPatchOperationValueDisplay(undefined)).toBe('');
  });

  it('returns empty string for value part without value key', () => {
    expect(getFhirPatchOperationValueDisplay({ someOtherKey: 'value' })).toBe('');
  });

  describe('primitive data types', () => {
    it('handles valueString', () => {
      const valuePart = { valueString: 'test string' };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('test string');
    });

    it('handles valueBoolean', () => {
      const valuePart = { valueBoolean: true };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('true');
    });

    it('handles valueInteger', () => {
      const valuePart = { valueInteger: 42 };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('42');
    });

    it('handles valueDecimal', () => {
      const valuePart = { valueDecimal: 3.14 };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('3.14');
    });

    it('handles valueDate', () => {
      const valuePart = { valueDate: '2023-01-01' };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('2023-01-01');
    });

    it('handles valueDateTime', () => {
      const valuePart = { valueDateTime: '2023-01-01T10:00:00Z' };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('2023-01-01T10:00:00Z');
    });

    it('handles valueCode', () => {
      const valuePart = { valueCode: 'active' };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('active');
    });
  });

  describe('CodeableConcept', () => {
    it('handles valueCodeableConcept with coding display', () => {
      const valuePart = {
        valueCodeableConcept: {
          coding: [{ display: 'Active', code: 'active' }]
        }
      };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('Active');
    });

    it('handles valueCodeableConcept with text', () => {
      const valuePart = {
        valueCodeableConcept: {
          text: 'Custom text'
        }
      };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('Custom text');
    });

    it('handles valueCodeableConcept with coding code only', () => {
      const valuePart = {
        valueCodeableConcept: {
          coding: [{ code: 'active' }]
        }
      };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('active');
    });
  });

  describe('Coding', () => {
    it('handles valueCoding with display', () => {
      const valuePart = {
        valueCoding: { display: 'Active', code: 'active' }
      };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('Active');
    });

    it('handles valueCoding with code only', () => {
      const valuePart = {
        valueCoding: { code: 'active' }
      };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('active');
    });
  });

  describe('Reference', () => {
    it('handles valueReference with display', () => {
      const valuePart = {
        valueReference: { display: 'John Smith', reference: 'Patient/123' }
      };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('John Smith');
    });

    it('handles valueReference with reference only', () => {
      const valuePart = {
        valueReference: { reference: 'Patient/123' }
      };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('Patient/123');
    });
  });

  describe('Quantity types', () => {
    it('handles valueQuantity with value and unit', () => {
      const valuePart = {
        valueQuantity: { value: 70, unit: 'kg' }
      };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('70 kg');
    });

    it('handles valueQuantity with value and code', () => {
      const valuePart = {
        valueQuantity: { value: 70, code: 'kg' }
      };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('70 kg');
    });

    it('handles valueQuantity with value only', () => {
      const valuePart = {
        valueQuantity: { value: 70 }
      };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('70');
    });

    it('handles valueMoney', () => {
      const valuePart = {
        valueMoney: { value: 100.5, code: 'USD' }
      };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('100.5 USD');
    });

    it('handles valueAge', () => {
      const valuePart = {
        valueAge: { value: 25, unit: 'years' }
      };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('25 years');
    });
  });

  describe('HumanName', () => {
    it('handles valueHumanName', () => {
      const valuePart = {
        valueHumanName: [{ family: 'Smith', given: ['John'] }]
      };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('John Smith');
    });
  });

  describe('Address', () => {
    it('handles valueAddress with all fields', () => {
      const valuePart = {
        valueAddress: {
          line: ['123 Main St', 'Apt 4'],
          city: 'Springfield',
          state: 'IL',
          postalCode: '62701',
          country: 'USA'
        }
      };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe(
        '123 Main St, Apt 4, Springfield, IL, 62701, USA'
      );
    });

    it('handles valueAddress with partial fields', () => {
      const valuePart = {
        valueAddress: {
          city: 'Springfield',
          state: 'IL'
        }
      };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('Springfield, IL');
    });
  });

  describe('Period', () => {
    it('handles valuePeriod with start and end', () => {
      const valuePart = {
        valuePeriod: { start: '2023-01-01', end: '2023-12-31' }
      };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('2023-01-01 – 2023-12-31');
    });

    it('handles valuePeriod with start only', () => {
      const valuePart = {
        valuePeriod: { start: '2023-01-01' }
      };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('2023-01-01 –');
    });

    it('handles valuePeriod with end only', () => {
      const valuePart = {
        valuePeriod: { end: '2023-12-31' }
      };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('– 2023-12-31');
    });
  });

  describe('Range', () => {
    it('handles valueRange with low and high', () => {
      const valuePart = {
        valueRange: {
          low: { value: 10, unit: 'mg' },
          high: { value: 20, unit: 'mg' }
        }
      };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('10 mg – 20 mg');
    });

    it('handles valueRange with low only', () => {
      const valuePart = {
        valueRange: {
          low: { value: 10, unit: 'mg' }
        }
      };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('10 mg');
    });
  });

  describe('Ratio', () => {
    it('handles valueRatio with numerator and denominator', () => {
      const valuePart = {
        valueRatio: {
          numerator: { value: 1, unit: 'tablet' },
          denominator: { value: 1, unit: 'day' }
        }
      };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('1 tablet / 1 day');
    });

    it('handles valueRatio with numerator only', () => {
      const valuePart = {
        valueRatio: {
          numerator: { value: 1, unit: 'tablet' }
        }
      };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('1 tablet');
    });
  });

  describe('other complex types', () => {
    it('handles valueAttachment with title', () => {
      const valuePart = {
        valueAttachment: { title: 'Lab Results', contentType: 'application/pdf' }
      };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('Lab Results');
    });

    it('handles valueAttachment with url', () => {
      const valuePart = {
        valueAttachment: { url: 'http://example.com/file.pdf' }
      };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('http://example.com/file.pdf');
    });

    it('handles valueIdentifier', () => {
      const valuePart = {
        valueIdentifier: { system: 'http://example.com', value: '12345' }
      };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('http://example.com | 12345');
    });

    it('handles valueContactPoint', () => {
      const valuePart = {
        valueContactPoint: { system: 'email', value: 'test@example.com' }
      };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('email: test@example.com');
    });

    it('handles valueAnnotation', () => {
      const valuePart = {
        valueAnnotation: { text: 'Patient notes' }
      };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('Patient notes');
    });

    it('handles valueTiming', () => {
      const valuePart = {
        valueTiming: { code: { text: 'Daily' } }
      };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('Daily');
    });

    it('handles valueSampledData', () => {
      const valuePart = {
        valueSampledData: { data: '1.0 2.0 3.0 4.0 5.0 6.0 7.0 8.0 9.0 10.0 11.0 12.0' }
      };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe(
        'SampledData: 1.0 2.0 3.0 4.0 5.0 ...'
      );
    });

    it('handles valueMeta', () => {
      const valuePart = {
        valueMeta: { versionId: '1', lastUpdated: '2023-01-01T10:00:00Z' }
      };
      expect(getFhirPatchOperationValueDisplay(valuePart)).toBe('1');
    });
  });

  it('returns JSON stringified value for unknown types', () => {
    const valuePart = { valueUnknown: { complex: 'object' } };
    expect(getFhirPatchOperationValueDisplay(valuePart)).toBe(JSON.stringify(valuePart, null, 2));
  });
});

describe('getPopulatedResourceMap', () => {
  it('handles empty context', () => {
    const result = getPopulatedResourceMap({});
    expect(result.size).toBe(0);
  });

  it('adds single FHIR resource to map', () => {
    const context = {
      patient: {
        resourceType: 'Patient',
        id: 'patient-123',
        name: [{ family: 'Smith' }]
      }
    };
    const result = getPopulatedResourceMap(context);
    expect(result.size).toBe(1);
    expect(result.get('patient-123')).toEqual(context.patient);
  });

  it('skips resources without id', () => {
    const context = {
      patient: {
        resourceType: 'Patient',
        name: [{ family: 'Smith' }]
      }
    };
    const result = getPopulatedResourceMap(context);
    expect(result.size).toBe(0);
  });

  it('handles Bundle resource and extracts entries', () => {
    const context = {
      bundle: {
        resourceType: 'Bundle',
        id: 'bundle-123',
        type: 'collection',
        entry: [
          {
            resource: {
              resourceType: 'Patient',
              id: 'patient-1',
              name: [{ family: 'Smith' }]
            }
          },
          {
            resource: {
              resourceType: 'Condition',
              id: 'condition-1',
              code: { text: 'Diabetes' }
            }
          },
          {
            resource: {
              resourceType: 'Observation',
              // Missing id - should be skipped
              status: 'final'
            }
          }
        ]
      }
    };
    const result = getPopulatedResourceMap(context);
    expect(result.size).toBe(2);
    expect(result.get('patient-1')).toEqual(context.bundle.entry[0].resource);
    expect(result.get('condition-1')).toEqual(context.bundle.entry[1].resource);
  });

  it('handles mixed Bundle and individual resources', () => {
    const context = {
      patient: {
        resourceType: 'Patient',
        id: 'patient-direct',
        name: [{ family: 'Direct' }]
      },
      bundle: {
        resourceType: 'Bundle',
        id: 'bundle-123',
        type: 'collection',
        entry: [
          {
            resource: {
              resourceType: 'Patient',
              id: 'patient-bundled',
              name: [{ family: 'Bundled' }]
            }
          }
        ]
      }
    };
    const result = getPopulatedResourceMap(context);
    expect(result.size).toBe(2);
    expect(result.get('patient-direct')).toEqual(context.patient);
    expect(result.get('patient-bundled')).toEqual(context.bundle.entry[0].resource);
  });

  it('handles Bundle without entries', () => {
    const context = {
      bundle: {
        resourceType: 'Bundle',
        id: 'bundle-123',
        type: 'collection'
      }
    };
    const result = getPopulatedResourceMap(context);
    expect(result.size).toBe(0);
  });

  it('skips non-resource values', () => {
    const context = {
      notAResource: 'just a string',
      alsoNotAResource: { someKey: 'someValue' },
      validResource: {
        resourceType: 'Patient',
        id: 'patient-1',
        name: [{ family: 'Smith' }]
      }
    };
    const result = getPopulatedResourceMap(context);
    expect(result.size).toBe(1);
    expect(result.get('patient-1')).toEqual(context.validResource);
  });

  it('handles empty Bundle entries', () => {
    const context = {
      bundle: {
        resourceType: 'Bundle',
        id: 'bundle-123',
        type: 'collection',
        entry: [
          {
            /* no resource */
          },
          {
            resource: {
              resourceType: 'Patient',
              id: 'patient-1',
              name: [{ family: 'Smith' }]
            }
          }
        ]
      }
    };
    const result = getPopulatedResourceMap(context);
    expect(result.size).toBe(1);
    expect(result.get('patient-1')).toEqual(context.bundle.entry[1].resource);
  });
});
