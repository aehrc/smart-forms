import { describe, expect } from 'vitest';
import {
  createSelectionKey,
  getEntriesValidKeys,
  getFilteredBundleEntries,
  getOperationEntryCounts
} from '../features/writeBack/utils/extractedBundleSelector.ts';
import { randomBundleEntries } from './resources/randomBundleEntries.ts';
import { extractedMedicalHistoryCurrentProblemsWithPatch } from './resources/extractedMedicalHistoryCurrentProblemsWithPatch.ts';
import type { FhirPatchParameters } from '@aehrc/sdc-template-extract';

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
