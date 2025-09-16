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

import { responseIsOperationOutcome } from '../utils/operationOutcome';
import type { OperationOutcome } from 'fhir/r4';

describe('operationOutcome utility', () => {
  describe('responseIsOperationOutcome', () => {
    it('should return true for valid OperationOutcome resource', () => {
      const operationOutcome: OperationOutcome = {
        resourceType: 'OperationOutcome',
        issue: [
          {
            severity: 'error',
            code: 'processing',
            details: {
              text: 'Test error message'
            }
          }
        ]
      };

      expect(responseIsOperationOutcome(operationOutcome)).toBe(true);
    });

    it('should return true for minimal OperationOutcome with only resourceType', () => {
      const minimalOperationOutcome = {
        resourceType: 'OperationOutcome'
      };

      expect(responseIsOperationOutcome(minimalOperationOutcome)).toBe(true);
    });

    it('should return false for different FHIR resource types', () => {
      const patient = {
        resourceType: 'Patient',
        id: 'example-patient'
      };

      expect(responseIsOperationOutcome(patient)).toBe(false);
    });

    it('should return false for questionnaire resource', () => {
      const questionnaire = {
        resourceType: 'Questionnaire',
        id: 'example-questionnaire',
        status: 'active'
      };

      expect(responseIsOperationOutcome(questionnaire)).toBe(false);
    });

    it('should return false for null input', () => {
      expect(responseIsOperationOutcome(null)).toBe(false);
    });

    it('should return false for undefined input', () => {
      expect(responseIsOperationOutcome(undefined)).toBe(false);
    });

    it('should return false for empty object', () => {
      expect(responseIsOperationOutcome({})).toBe(false);
    });

    it('should return false for object without resourceType', () => {
      const objectWithoutResourceType = {
        id: 'some-id',
        status: 'active'
      };

      expect(responseIsOperationOutcome(objectWithoutResourceType)).toBe(false);
    });

    it('should return false for primitive values', () => {
      expect(responseIsOperationOutcome('string')).toBe(false);
      expect(responseIsOperationOutcome(123)).toBe(false);
      expect(responseIsOperationOutcome(true)).toBe(false);
      expect(responseIsOperationOutcome(false)).toBe(false);
    });

    it('should return false for arrays', () => {
      expect(responseIsOperationOutcome([])).toBe(false);
      expect(responseIsOperationOutcome([{ resourceType: 'OperationOutcome' }])).toBe(false);
    });

    it('should handle complex OperationOutcome with multiple issues', () => {
      const complexOperationOutcome: OperationOutcome = {
        resourceType: 'OperationOutcome',
        id: 'complex-outcome',
        meta: {
          versionId: '1',
          lastUpdated: '2024-01-01T00:00:00Z'
        },
        issue: [
          {
            severity: 'error',
            code: 'processing',
            details: {
              text: 'First error'
            },
            location: ['field1']
          },
          {
            severity: 'warning',
            code: 'informational',
            details: {
              text: 'Warning message'
            },
            location: ['field2']
          }
        ]
      };

      expect(responseIsOperationOutcome(complexOperationOutcome)).toBe(true);
    });

    it('should return false for object with incorrect resourceType case', () => {
      const incorrectCase = {
        resourceType: 'operationoutcome' // lowercase
      };

      expect(responseIsOperationOutcome(incorrectCase)).toBe(false);
    });

    it('should return false for object with resourceType as non-string', () => {
      const nonStringResourceType = {
        resourceType: 123
      };

      expect(responseIsOperationOutcome(nonStringResourceType)).toBe(false);
    });

    it('should handle objects with additional properties', () => {
      const operationOutcomeWithExtra = {
        resourceType: 'OperationOutcome',
        extraProperty: 'should not matter',
        anotherExtra: { nested: 'object' },
        issue: []
      };

      expect(responseIsOperationOutcome(operationOutcomeWithExtra)).toBe(true);
    });

    it('should use type guard correctly in TypeScript', () => {
      const response: unknown = {
        resourceType: 'OperationOutcome',
        issue: []
      };

      if (responseIsOperationOutcome(response)) {
        // TypeScript should narrow the type to OperationOutcome here
        expect(response.resourceType).toBe('OperationOutcome');
        expect(response.issue).toBeDefined();
      }
    });
  });
});
