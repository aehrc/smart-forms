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

import type { Extension, Questionnaire } from 'fhir/r4';
import {
  constructTargetConstraint,
  extractTargetConstraints
} from '../utils/questionnaireStoreUtils/extractTargetConstraint';

describe('extractTargetConstraint - Phase 5', () => {
  describe('constructTargetConstraint', () => {
    it('should construct valid target constraint with all required fields', () => {
      const extension: Extension = {
        url: 'http://hl7.org/fhir/StructureDefinition/targetConstraint',
        extension: [
          { url: 'key', valueId: 'constraint-1' },
          { url: 'severity', valueCode: 'error' },
          { url: 'expression', valueExpression: { expression: 'age > 0', language: 'text/fhirpath' } },
          { url: 'human', valueString: 'Age must be greater than 0' }
        ]
      };

      const result = constructTargetConstraint(extension);

      expect(result).toEqual({
        key: 'constraint-1',
        severityCode: 'error',
        valueExpression: { expression: 'age > 0', language: 'text/fhirpath' },
        human: 'Age must be greater than 0',
        location: undefined
      });
    });

    it('should construct target constraint with location field', () => {
      const extension: Extension = {
        url: 'http://hl7.org/fhir/StructureDefinition/targetConstraint',
        extension: [
          { url: 'key', valueId: 'constraint-2' },
          { url: 'severity', valueCode: 'warning' },
          { url: 'expression', valueExpression: { expression: 'name.length > 0', language: 'text/fhirpath' } },
          { url: 'human', valueString: 'Name is required' },
          { url: 'location', valueString: 'Patient.name' }
        ]
      };

      const result = constructTargetConstraint(extension);

      expect(result).toEqual({
        key: 'constraint-2',
        severityCode: 'warning',
        valueExpression: { expression: 'name.length > 0', language: 'text/fhirpath' },
        human: 'Name is required',
        location: 'Patient.name'
      });
    });

    it('should return null when extension URL is incorrect', () => {
      const extension: Extension = {
        url: 'http://example.com/wrong-url',
        extension: [
          { url: 'key', valueId: 'constraint-1' },
          { url: 'severity', valueCode: 'error' },
          { url: 'expression', valueExpression: { expression: 'age > 0', language: 'text/fhirpath' } },
          { url: 'human', valueString: 'Age must be greater than 0' }
        ]
      };

      const result = constructTargetConstraint(extension);

      expect(result).toBeNull();
    });

    it('should return null when key is missing', () => {
      const extension: Extension = {
        url: 'http://hl7.org/fhir/StructureDefinition/targetConstraint',
        extension: [
          { url: 'severity', valueCode: 'error' },
          { url: 'expression', valueExpression: { expression: 'age > 0', language: 'text/fhirpath' } },
          { url: 'human', valueString: 'Age must be greater than 0' }
        ]
      };

      const result = constructTargetConstraint(extension);

      expect(result).toBeNull();
    });

    it('should return null when key valueId is not a string', () => {
      const extension: Extension = {
        url: 'http://hl7.org/fhir/StructureDefinition/targetConstraint',
        extension: [
          { url: 'key', valueInteger: 123 }, // invalid type
          { url: 'severity', valueCode: 'error' },
          { url: 'expression', valueExpression: { expression: 'age > 0', language: 'text/fhirpath' } },
          { url: 'human', valueString: 'Age must be greater than 0' }
        ]
      };

      const result = constructTargetConstraint(extension);

      expect(result).toBeNull();
    });

    it('should return null when severity is missing', () => {
      const extension: Extension = {
        url: 'http://hl7.org/fhir/StructureDefinition/targetConstraint',
        extension: [
          { url: 'key', valueId: 'constraint-1' },
          { url: 'expression', valueExpression: { expression: 'age > 0', language: 'text/fhirpath' } },
          { url: 'human', valueString: 'Age must be greater than 0' }
        ]
      };

      const result = constructTargetConstraint(extension);

      expect(result).toBeNull();
    });

    it('should return null when severity has invalid valueCode', () => {
      const extension: Extension = {
        url: 'http://hl7.org/fhir/StructureDefinition/targetConstraint',
        extension: [
          { url: 'key', valueId: 'constraint-1' },
          { url: 'severity', valueCode: 'info' }, // invalid severity
          { url: 'expression', valueExpression: { expression: 'age > 0', language: 'text/fhirpath' } },
          { url: 'human', valueString: 'Age must be greater than 0' }
        ]
      };

      const result = constructTargetConstraint(extension);

      expect(result).toBeNull();
    });

    it('should return null when expression is missing', () => {
      const extension: Extension = {
        url: 'http://hl7.org/fhir/StructureDefinition/targetConstraint',
        extension: [
          { url: 'key', valueId: 'constraint-1' },
          { url: 'severity', valueCode: 'error' },
          { url: 'human', valueString: 'Age must be greater than 0' }
        ]
      };

      const result = constructTargetConstraint(extension);

      expect(result).toBeNull();
    });

    it('should return null when expression valueExpression is missing', () => {
      const extension: Extension = {
        url: 'http://hl7.org/fhir/StructureDefinition/targetConstraint',
        extension: [
          { url: 'key', valueId: 'constraint-1' },
          { url: 'severity', valueCode: 'error' },
          { url: 'expression' }, // missing valueExpression
          { url: 'human', valueString: 'Age must be greater than 0' }
        ]
      };

      const result = constructTargetConstraint(extension);

      expect(result).toBeNull();
    });

    it('should return null when human is missing', () => {
      const extension: Extension = {
        url: 'http://hl7.org/fhir/StructureDefinition/targetConstraint',
        extension: [
          { url: 'key', valueId: 'constraint-1' },
          { url: 'severity', valueCode: 'error' },
          { url: 'expression', valueExpression: { expression: 'age > 0', language: 'text/fhirpath' } }
        ]
      };

      const result = constructTargetConstraint(extension);

      expect(result).toBeNull();
    });

    it('should return null when human valueString is missing', () => {
      const extension: Extension = {
        url: 'http://hl7.org/fhir/StructureDefinition/targetConstraint',
        extension: [
          { url: 'key', valueId: 'constraint-1' },
          { url: 'severity', valueCode: 'error' },
          { url: 'expression', valueExpression: { expression: 'age > 0', language: 'text/fhirpath' } },
          { url: 'human' } // missing valueString
        ]
      };

      const result = constructTargetConstraint(extension);

      expect(result).toBeNull();
    });

    it('should return null when extension array is missing', () => {
      const extension: Extension = {
        url: 'http://hl7.org/fhir/StructureDefinition/targetConstraint'
        // no extension array
      };

      const result = constructTargetConstraint(extension);

      expect(result).toBeNull();
    });

    it('should handle both error and warning severity codes', () => {
      const errorExtension: Extension = {
        url: 'http://hl7.org/fhir/StructureDefinition/targetConstraint',
        extension: [
          { url: 'key', valueId: 'error-constraint' },
          { url: 'severity', valueCode: 'error' },
          { url: 'expression', valueExpression: { expression: 'age > 0', language: 'text/fhirpath' } },
          { url: 'human', valueString: 'Age must be greater than 0' }
        ]
      };

      const warningExtension: Extension = {
        url: 'http://hl7.org/fhir/StructureDefinition/targetConstraint',
        extension: [
          { url: 'key', valueId: 'warning-constraint' },
          { url: 'severity', valueCode: 'warning' },
          { url: 'expression', valueExpression: { expression: 'name.exists()', language: 'text/fhirpath' } },
          { url: 'human', valueString: 'Name should be provided' }
        ]
      };

      const errorResult = constructTargetConstraint(errorExtension);
      const warningResult = constructTargetConstraint(warningExtension);

      expect(errorResult?.severityCode).toBe('error');
      expect(warningResult?.severityCode).toBe('warning');
    });
  });

  describe('extractTargetConstraints', () => {
    it('should return empty object when questionnaire has no extensions', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active'
        // no extension property
      };

      const result = extractTargetConstraints(questionnaire);

      expect(result).toEqual({});
    });

    it('should return empty object when questionnaire has empty extensions array', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        extension: []
      };

      const result = extractTargetConstraints(questionnaire);

      expect(result).toEqual({});
    });

    it('should extract single target constraint', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/targetConstraint',
            extension: [
              { url: 'key', valueId: 'age-constraint' },
              { url: 'severity', valueCode: 'error' },
              { url: 'expression', valueExpression: { expression: 'age >= 18', language: 'text/fhirpath' } },
              { url: 'human', valueString: 'Age must be 18 or older' }
            ]
          }
        ]
      };

      const result = extractTargetConstraints(questionnaire);

      expect(result).toEqual({
        'age-constraint': {
          key: 'age-constraint',
          severityCode: 'error',
          valueExpression: { expression: 'age >= 18', language: 'text/fhirpath' },
          human: 'Age must be 18 or older',
          location: undefined
        }
      });
    });

    it('should extract multiple target constraints', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/targetConstraint',
            extension: [
              { url: 'key', valueId: 'age-constraint' },
              { url: 'severity', valueCode: 'error' },
              { url: 'expression', valueExpression: { expression: 'age >= 18', language: 'text/fhirpath' } },
              { url: 'human', valueString: 'Age must be 18 or older' }
            ]
          },
          {
            url: 'http://hl7.org/fhir/StructureDefinition/targetConstraint',
            extension: [
              { url: 'key', valueId: 'name-constraint' },
              { url: 'severity', valueCode: 'warning' },
              { url: 'expression', valueExpression: { expression: 'name.length > 2', language: 'text/fhirpath' } },
              { url: 'human', valueString: 'Name should be more than 2 characters' },
              { url: 'location', valueString: 'Patient.name' }
            ]
          }
        ]
      };

      const result = extractTargetConstraints(questionnaire);

      expect(result).toEqual({
        'age-constraint': {
          key: 'age-constraint',
          severityCode: 'error',
          valueExpression: { expression: 'age >= 18', language: 'text/fhirpath' },
          human: 'Age must be 18 or older',
          location: undefined
        },
        'name-constraint': {
          key: 'name-constraint',
          severityCode: 'warning',
          valueExpression: { expression: 'name.length > 2', language: 'text/fhirpath' },
          human: 'Name should be more than 2 characters',
          location: 'Patient.name'
        }
      });
    });

    it('should skip invalid target constraints and include valid ones', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        extension: [
          {
            url: 'http://example.com/wrong-url', // invalid URL
            extension: [
              { url: 'key', valueId: 'invalid-constraint' },
              { url: 'severity', valueCode: 'error' },
              { url: 'expression', valueExpression: { expression: 'true', language: 'text/fhirpath' } },
              { url: 'human', valueString: 'Invalid constraint' }
            ]
          },
          {
            url: 'http://hl7.org/fhir/StructureDefinition/targetConstraint',
            extension: [
              { url: 'key', valueId: 'valid-constraint' },
              { url: 'severity', valueCode: 'error' },
              { url: 'expression', valueExpression: { expression: 'age > 0', language: 'text/fhirpath' } },
              { url: 'human', valueString: 'Valid constraint' }
            ]
          },
          {
            url: 'http://hl7.org/fhir/StructureDefinition/targetConstraint',
            extension: [
              { url: 'key', valueId: 'incomplete-constraint' },
              { url: 'severity', valueCode: 'error' }
              // missing expression and human
            ]
          }
        ]
      };

      const result = extractTargetConstraints(questionnaire);

      expect(result).toEqual({
        'valid-constraint': {
          key: 'valid-constraint',
          severityCode: 'error',
          valueExpression: { expression: 'age > 0', language: 'text/fhirpath' },
          human: 'Valid constraint',
          location: undefined
        }
      });
    });

    it('should skip extensions that return null target constraints', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/targetConstraint',
            extension: [
              { url: 'key', valueId: 'constraint-without-key' }
              // missing required fields
            ]
          },
          {
            url: 'http://hl7.org/fhir/StructureDefinition/other-extension',
            extension: [
              { url: 'someField', valueString: 'someValue' }
            ]
          }
        ]
      };

      const result = extractTargetConstraints(questionnaire);

      expect(result).toEqual({});
    });

    it('should handle target constraint without key property gracefully', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/targetConstraint',
            extension: [
              { url: 'severity', valueCode: 'error' },
              { url: 'expression', valueExpression: { expression: 'true', language: 'text/fhirpath' } },
              { url: 'human', valueString: 'Some constraint' }
              // missing key
            ]
          }
        ]
      };

      const result = extractTargetConstraints(questionnaire);

      expect(result).toEqual({});
    });
  });
});
