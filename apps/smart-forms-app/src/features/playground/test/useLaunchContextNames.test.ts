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

import { renderHook } from '@testing-library/react';
import useLaunchContextNames from '../hooks/useLaunchContextNames';
import type { Patient, Practitioner } from 'fhir/r4';
import { constructName } from '../../../utils/humanName';

// Mock the constructName utility
jest.mock('../../../utils/humanName', () => ({
  constructName: jest.fn()
}));

describe('useLaunchContextNames', () => {
  const mockConstructName = constructName as jest.MockedFunction<typeof constructName>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('patientName', () => {
    it('returns constructed name when patient has name', () => {
      const patient: Patient = {
        resourceType: 'Patient',
        id: 'patient-123',
        name: [{ family: 'Doe', given: ['John'] }]
      };

      mockConstructName.mockReturnValue('John Doe');

      const { result } = renderHook(() => useLaunchContextNames(patient, null));

      expect(result.current.patientName).toBe('John Doe');
      expect(mockConstructName).toHaveBeenCalledWith([{ family: 'Doe', given: ['John'] }]);
    });

    it('returns patient id when patient has no name', () => {
      const patient: Patient = {
        resourceType: 'Patient',
        id: 'patient-123'
      };

      const { result } = renderHook(() => useLaunchContextNames(patient, null));

      expect(result.current.patientName).toBe('patient-123');
      expect(mockConstructName).not.toHaveBeenCalled();
    });

    it('returns null when patient is null', () => {
      const { result } = renderHook(() => useLaunchContextNames(null, null));

      expect(result.current.patientName).toBeNull();
      expect(mockConstructName).not.toHaveBeenCalled();
    });

    it('returns null when patient has no id and no name', () => {
      const patient: Patient = {
        resourceType: 'Patient'
      };

      const { result } = renderHook(() => useLaunchContextNames(patient, null));

      expect(result.current.patientName).toBeNull();
      expect(mockConstructName).not.toHaveBeenCalled();
    });
  });

  describe('userName', () => {
    it('returns constructed name when user has name', () => {
      const user: Practitioner = {
        resourceType: 'Practitioner',
        id: 'practitioner-456',
        name: [{ family: 'Smith', given: ['Dr', 'Jane'] }]
      };

      mockConstructName.mockReturnValue('Dr Jane Smith');

      const { result } = renderHook(() => useLaunchContextNames(null, user));

      expect(result.current.userName).toBe('Dr Jane Smith');
      expect(mockConstructName).toHaveBeenCalledWith([{ family: 'Smith', given: ['Dr', 'Jane'] }]);
    });

    it('returns user id when user has no name', () => {
      const user: Practitioner = {
        resourceType: 'Practitioner',
        id: 'practitioner-456'
      };

      const { result } = renderHook(() => useLaunchContextNames(null, user));

      expect(result.current.userName).toBe('practitioner-456');
      expect(mockConstructName).not.toHaveBeenCalled();
    });

    it('returns null when user is null', () => {
      const { result } = renderHook(() => useLaunchContextNames(null, null));

      expect(result.current.userName).toBeNull();
      expect(mockConstructName).not.toHaveBeenCalled();
    });

    it('returns null when user has no id and no name', () => {
      const user: Practitioner = {
        resourceType: 'Practitioner'
      };

      const { result } = renderHook(() => useLaunchContextNames(null, user));

      expect(result.current.userName).toBeNull();
      expect(mockConstructName).not.toHaveBeenCalled();
    });
  });

  describe('both patient and user', () => {
    it('handles both patient and user with names correctly', () => {
      const patient: Patient = {
        resourceType: 'Patient',
        id: 'patient-123',
        name: [{ family: 'Doe', given: ['John'] }]
      };

      const user: Practitioner = {
        resourceType: 'Practitioner',
        id: 'practitioner-456',
        name: [{ family: 'Smith', given: ['Dr', 'Jane'] }]
      };

      mockConstructName.mockReturnValueOnce('John Doe').mockReturnValueOnce('Dr Jane Smith');

      const { result } = renderHook(() => useLaunchContextNames(patient, user));

      expect(result.current.patientName).toBe('John Doe');
      expect(result.current.userName).toBe('Dr Jane Smith');
      expect(mockConstructName).toHaveBeenCalledTimes(2);
    });

    it('memoizes patient name correctly when patient changes', () => {
      const patient1: Patient = {
        resourceType: 'Patient',
        id: 'patient-123',
        name: [{ family: 'Doe', given: ['John'] }]
      };

      const patient2: Patient = {
        resourceType: 'Patient',
        id: 'patient-456',
        name: [{ family: 'Smith', given: ['Jane'] }]
      };

      mockConstructName.mockReturnValueOnce('John Doe').mockReturnValueOnce('Jane Smith');

      const { result, rerender } = renderHook(
        ({ patient, user }) => useLaunchContextNames(patient, user),
        { initialProps: { patient: patient1, user: null } }
      );

      expect(result.current.patientName).toBe('John Doe');

      // Rerender with new patient
      rerender({ patient: patient2, user: null });

      expect(result.current.patientName).toBe('Jane Smith');
      expect(mockConstructName).toHaveBeenCalledTimes(2);
    });
  });
});
