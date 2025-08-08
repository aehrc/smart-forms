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

import { readPatient, readUser, readEncounter } from '../api/smartClient';
import type { Encounter, Patient, Practitioner } from 'fhir/r4';

// Mock the client type
interface MockClient {
  patient: {
    read: jest.MockedFunction<() => Promise<Patient>>;
  };
  user: {
    read: jest.MockedFunction<() => Promise<Patient | Practitioner>>;
  };
  encounter: {
    read: jest.MockedFunction<() => Promise<Encounter>>;
  };
}

describe('smartClient', () => {
  let mockClient: MockClient;

  beforeEach(() => {
    mockClient = {
      patient: {
        read: jest.fn()
      },
      user: {
        read: jest.fn()
      },
      encounter: {
        read: jest.fn()
      }
    };
  });

  describe('readPatient', () => {
    it('should successfully read a patient', async () => {
      const mockPatient: Patient = {
        resourceType: 'Patient',
        id: 'patient-123',
        name: [{ family: 'Doe', given: ['John'] }]
      };

      mockClient.patient.read.mockResolvedValue(mockPatient);

      const result = await readPatient(mockClient as any);

      expect(mockClient.patient.read).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockPatient);
    });

    it('should handle errors when reading patient', async () => {
      const error = new Error('Failed to read patient');
      mockClient.patient.read.mockRejectedValue(error);

      await expect(readPatient(mockClient as any)).rejects.toThrow('Failed to read patient');
      expect(mockClient.patient.read).toHaveBeenCalledTimes(1);
    });
  });

  describe('readUser', () => {
    it('should successfully read a practitioner user', async () => {
      const mockPractitioner: Practitioner = {
        resourceType: 'Practitioner',
        id: 'practitioner-123',
        name: [{ family: 'Smith', given: ['Jane'] }]
      };

      mockClient.user.read.mockResolvedValue(mockPractitioner);

      const result = await readUser(mockClient as any);

      expect(mockClient.user.read).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockPractitioner);
    });

    it('should handle errors when reading user', async () => {
      const error = new Error('Failed to read user');
      mockClient.user.read.mockRejectedValue(error);

      await expect(readUser(mockClient as any)).rejects.toThrow('Failed to read user');
      expect(mockClient.user.read).toHaveBeenCalledTimes(1);
    });

    it('should cast non-Practitioner user resource to Practitioner', async () => {
      const mockResource = {
        resourceType: 'Person',
        id: 'person-123'
      };

      mockClient.user.read.mockResolvedValue(mockResource as any);

      const result = await readUser(mockClient as any);

      expect(mockClient.user.read).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockResource);
    });
  });

  describe('readEncounter', () => {
    it('should successfully read an encounter', async () => {
      const mockEncounter: Encounter = {
        resourceType: 'Encounter',
        id: 'encounter-123',
        status: 'finished',
        class: {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: 'AMB'
        }
      };

      mockClient.encounter.read.mockResolvedValue(mockEncounter);

      const result = await readEncounter(mockClient as any);

      expect(mockClient.encounter.read).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockEncounter);
    });

    it('should handle errors when reading encounter', async () => {
      const error = new Error('Failed to read encounter');
      mockClient.encounter.read.mockRejectedValue(error);

      await expect(readEncounter(mockClient as any)).rejects.toThrow('Failed to read encounter');
      expect(mockClient.encounter.read).toHaveBeenCalledTimes(1);
    });

    it('should cast non-Encounter resource to Encounter', async () => {
      const mockResource = {
        resourceType: 'Appointment',
        id: 'appointment-123'
      };

      mockClient.encounter.read.mockResolvedValue(mockResource as any);

      const result = await readEncounter(mockClient as any);

      expect(mockClient.encounter.read).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockResource);
    });
  });
});
