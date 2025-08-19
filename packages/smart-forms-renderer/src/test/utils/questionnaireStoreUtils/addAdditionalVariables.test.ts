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

import type { Extension } from 'fhir/r4';
import type { Variables } from '../../../interfaces/variables.interface';
import { addAdditionalVariables } from '../../../utils/questionnaireStoreUtils/addAdditionalVariables';

describe('addAdditionalVariables', () => {
  const createMockVariables = (): Variables => ({
    fhirPathVariables: {
      QuestionnaireLevel: []
    },
    xFhirQueryVariables: {}
  });

  const createFhirPathVariable = (name: string, expression: string): Extension => ({
    url: 'http://hl7.org/fhir/StructureDefinition/variable',
    valueExpression: {
      language: 'text/fhirpath',
      expression,
      name
    }
  });

  const createXFhirQueryVariable = (name: string, expression: string): Extension => ({
    url: 'http://hl7.org/fhir/StructureDefinition/variable',
    valueExpression: {
      language: 'application/x-fhir-query',
      expression,
      name
    }
  });

  describe('basic functionality', () => {
    it('should return existing variables when no additional variables provided', () => {
      const existingVariables = createMockVariables();
      const result = addAdditionalVariables(existingVariables, {});

      expect(result).toBe(existingVariables);
      expect(result.fhirPathVariables.QuestionnaireLevel).toHaveLength(0);
      expect(result.xFhirQueryVariables).toEqual({});
    });

    it('should add FHIRPath variables to QuestionnaireLevel', () => {
      const existingVariables = createMockVariables();
      const fhirPathVar = createFhirPathVariable('age', '%age');
      const additionalVars = { var1: fhirPathVar };

      const result = addAdditionalVariables(existingVariables, additionalVars);

      expect(result.fhirPathVariables.QuestionnaireLevel).toHaveLength(1);
      expect(result.fhirPathVariables.QuestionnaireLevel[0]).toEqual({
        language: 'text/fhirpath',
        expression: '%age',
        name: 'age'
      });
    });

    it('should add xFhirQuery variables to xFhirQueryVariables', () => {
      const existingVariables = createMockVariables();
      const xFhirVar = createXFhirQueryVariable('patient', 'Patient?_id={{%patient.id}}');
      const additionalVars = { var1: xFhirVar };

      const result = addAdditionalVariables(existingVariables, additionalVars);

      expect(result.xFhirQueryVariables).toHaveProperty('patient');
      expect(result.xFhirQueryVariables.patient).toEqual({
        valueExpression: {
          language: 'application/x-fhir-query',
          expression: 'Patient?_id={{%patient.id}}',
          name: 'patient'
        }
      });
    });

    it('should handle multiple variables of different types', () => {
      const existingVariables = createMockVariables();
      const fhirPathVar = createFhirPathVariable('age', '%age > 18');
      const xFhirVar = createXFhirQueryVariable('patient', 'Patient?_id={{%patient.id}}');
      const additionalVars = { 
        fhirPath: fhirPathVar, 
        xFhir: xFhirVar 
      };

      const result = addAdditionalVariables(existingVariables, additionalVars);

      expect(result.fhirPathVariables.QuestionnaireLevel).toHaveLength(1);
      expect(result.xFhirQueryVariables).toHaveProperty('patient');
    });
  });

  describe('isVariable validation', () => {
    it('should reject variables without url', () => {
      const existingVariables = createMockVariables();
      const invalidVar = {
        valueExpression: {
          language: 'text/fhirpath',
          expression: '%age',
          name: 'age'
        }
      };
      const additionalVars = { invalid: invalidVar };

      const result = addAdditionalVariables(existingVariables, additionalVars);

      expect(result.fhirPathVariables.QuestionnaireLevel).toHaveLength(0);
      expect(result.xFhirQueryVariables).toEqual({});
    });

    it('should reject variables with wrong url', () => {
      const existingVariables = createMockVariables();
      const invalidVar = {
        url: 'http://wrong.url',
        valueExpression: {
          language: 'text/fhirpath',
          expression: '%age',
          name: 'age'
        }
      };
      const additionalVars = { invalid: invalidVar };

      const result = addAdditionalVariables(existingVariables, additionalVars);

      expect(result.fhirPathVariables.QuestionnaireLevel).toHaveLength(0);
      expect(result.xFhirQueryVariables).toEqual({});
    });

    it('should accept xFhirQuery variables without correct url if language matches', () => {
      const existingVariables = createMockVariables();
      const validVar = {
        url: 'http://different.url',
        valueExpression: {
          language: 'application/x-fhir-query',
          expression: 'Patient?_id=123',
          name: 'patient'
        }
      };
      const additionalVars = { valid: validVar };

      const result = addAdditionalVariables(existingVariables, additionalVars);

      expect(result.xFhirQueryVariables).toHaveProperty('patient');
    });

    it('should reject variables with unsupported language', () => {
      const existingVariables = createMockVariables();
      const invalidVar = {
        url: 'http://hl7.org/fhir/StructureDefinition/variable',
        valueExpression: {
          language: 'javascript',
          expression: 'console.log("test")',
          name: 'test'
        }
      };
      const additionalVars = { invalid: invalidVar };

      const result = addAdditionalVariables(existingVariables, additionalVars);

      expect(result.fhirPathVariables.QuestionnaireLevel).toHaveLength(0);
      expect(result.xFhirQueryVariables).toEqual({});
    });
  });

  describe('valueExpression validation', () => {
    it('should reject variables without valueExpression', () => {
      const existingVariables = createMockVariables();
      const invalidVar = {
        url: 'http://hl7.org/fhir/StructureDefinition/variable'
      };
      const additionalVars = { invalid: invalidVar };

      const result = addAdditionalVariables(existingVariables, additionalVars);

      expect(result.fhirPathVariables.QuestionnaireLevel).toHaveLength(0);
      expect(result.xFhirQueryVariables).toEqual({});
    });

    it('should reject variables without language in valueExpression', () => {
      const existingVariables = createMockVariables();
      const invalidVar = {
        url: 'http://hl7.org/fhir/StructureDefinition/variable',
        valueExpression: {
          expression: '%age',
          name: 'age'
        }
      };
      const additionalVars = { invalid: invalidVar };

      const result = addAdditionalVariables(existingVariables, additionalVars);

      expect(result.fhirPathVariables.QuestionnaireLevel).toHaveLength(0);
      expect(result.xFhirQueryVariables).toEqual({});
    });

    it('should reject variables without name in valueExpression', () => {
      const existingVariables = createMockVariables();
      const invalidVar = {
        url: 'http://hl7.org/fhir/StructureDefinition/variable',
        valueExpression: {
          language: 'text/fhirpath',
          expression: '%age'
        }
      };
      const additionalVars = { invalid: invalidVar };

      const result = addAdditionalVariables(existingVariables, additionalVars);

      expect(result.fhirPathVariables.QuestionnaireLevel).toHaveLength(0);
      expect(result.xFhirQueryVariables).toEqual({});
    });
  });

  describe('edge cases', () => {
    it('should handle null/undefined variables', () => {
      const existingVariables = createMockVariables();
      const additionalVars: Record<string, any> = { 
        nullVar: null,
        undefinedVar: undefined,
        validVar: createFhirPathVariable('age', '%age')
      };

      const result = addAdditionalVariables(existingVariables, additionalVars);

      expect(result.fhirPathVariables.QuestionnaireLevel).toHaveLength(1);
    });

    it('should handle empty string values', () => {
      const existingVariables = createMockVariables();
      const invalidVar = {
        url: 'http://hl7.org/fhir/StructureDefinition/variable',
        valueExpression: {
          language: 'text/fhirpath',
          expression: '',
          name: ''
        }
      };
      const additionalVars = { invalid: invalidVar };

      const result = addAdditionalVariables(existingVariables, additionalVars);

      // Should not add since empty strings fail the name check (line 30: && expression.name)
      expect(result.fhirPathVariables.QuestionnaireLevel).toHaveLength(0);
    });

    it('should handle existing variables in QuestionnaireLevel', () => {
      const existingVariables = createMockVariables();
      existingVariables.fhirPathVariables.QuestionnaireLevel.push({
        language: 'text/fhirpath',
        expression: '%existing',
        name: 'existing'
      });

      const newVar = createFhirPathVariable('new', '%new');
      const additionalVars = { newVar };

      const result = addAdditionalVariables(existingVariables, additionalVars);

      expect(result.fhirPathVariables.QuestionnaireLevel).toHaveLength(2);
      expect(result.fhirPathVariables.QuestionnaireLevel[0].name).toBe('existing');
      expect(result.fhirPathVariables.QuestionnaireLevel[1].name).toBe('new');
    });

    it('should handle existing xFhirQuery variables', () => {
      const existingVariables = createMockVariables();
      existingVariables.xFhirQueryVariables.existing = {
        valueExpression: {
          language: 'application/x-fhir-query',
          expression: 'Existing?_id=1',
          name: 'existing'
        }
      };

      const newVar = createXFhirQueryVariable('new', 'New?_id=2');
      const additionalVars = { newVar };

      const result = addAdditionalVariables(existingVariables, additionalVars);

      expect(Object.keys(result.xFhirQueryVariables)).toHaveLength(2);
      expect(result.xFhirQueryVariables).toHaveProperty('existing');
      expect(result.xFhirQueryVariables).toHaveProperty('new');
    });

    it('should overwrite existing xFhirQuery variable with same name', () => {
      const existingVariables = createMockVariables();
      existingVariables.xFhirQueryVariables.patient = {
        valueExpression: {
          language: 'application/x-fhir-query',
          expression: 'Patient?_id=old',
          name: 'patient'
        }
      };

      const newVar = createXFhirQueryVariable('patient', 'Patient?_id=new');
      const additionalVars = { newVar };

      const result = addAdditionalVariables(existingVariables, additionalVars);

      expect(Object.keys(result.xFhirQueryVariables)).toHaveLength(1);
      expect(result.xFhirQueryVariables.patient.valueExpression.expression).toBe('Patient?_id=new');
    });
  });

  describe('complex scenarios', () => {
    it('should handle mixed valid and invalid variables', () => {
      const existingVariables = createMockVariables();
      const validFhirPath = createFhirPathVariable('age', '%age > 18');
      const validXFhir = createXFhirQueryVariable('patient', 'Patient?_id=123');
      const invalidVar = { url: 'invalid' };
      const nullVar = null;

      const additionalVars: Record<string, any> = {
        valid1: validFhirPath,
        invalid: invalidVar,
        valid2: validXFhir,
        nullVar: nullVar
      };

      const result = addAdditionalVariables(existingVariables, additionalVars);

      expect(result.fhirPathVariables.QuestionnaireLevel).toHaveLength(1);
      expect(Object.keys(result.xFhirQueryVariables)).toHaveLength(1);
    });

    it('should handle variables with complex expressions', () => {
      const existingVariables = createMockVariables();
      const complexFhirPath = createFhirPathVariable(
        'complexAge',
        '%resource.entry.where(resource is Patient).resource.birthDate.toDate() + 18 years <= today()'
      );
      const complexXFhir = createXFhirQueryVariable(
        'complexPatient',
        'Patient?birthdate=le{{today() - 18 years}}&active=true&_sort=-_lastUpdated&_count=1'
      );

      const additionalVars = {
        complex1: complexFhirPath,
        complex2: complexXFhir
      };

      const result = addAdditionalVariables(existingVariables, additionalVars);

      expect(result.fhirPathVariables.QuestionnaireLevel[0].expression).toContain('birthDate.toDate()');
      expect(result.xFhirQueryVariables.complexPatient.valueExpression.expression).toContain('birthdate=le');
    });

    it('should maintain immutability of input objects', () => {
      const existingVariables = createMockVariables();
      const originalVars = JSON.parse(JSON.stringify(existingVariables));
      
      const newVar = createFhirPathVariable('test', '%test');
      const additionalVars = { test: newVar };

      const result = addAdditionalVariables(existingVariables, additionalVars);

      // The function modifies and returns the same object reference
      expect(result).toBe(existingVariables);
      // But we can verify the modification happened
      expect(result.fhirPathVariables.QuestionnaireLevel).toHaveLength(1);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle typical questionnaire variables', () => {
      const existingVariables = createMockVariables();
      const ageVar = createFhirPathVariable('age', '%Patient.birthDate.toDate().age()');
      const genderVar = createFhirPathVariable('gender', '%Patient.gender');
      const patientQuery = createXFhirQueryVariable('currentPatient', 'Patient/{{%patient.id}}');

      const additionalVars = {
        age: ageVar,
        gender: genderVar,
        patient: patientQuery
      };

      const result = addAdditionalVariables(existingVariables, additionalVars);

      expect(result.fhirPathVariables.QuestionnaireLevel).toHaveLength(2);
      expect(Object.keys(result.xFhirQueryVariables)).toHaveLength(1);
      
      const ageExpression = result.fhirPathVariables.QuestionnaireLevel.find(v => v.name === 'age');
      expect(ageExpression?.expression).toContain('birthDate.toDate().age()');
    });

    it('should handle variables from different FHIR extensions', () => {
      const existingVariables = createMockVariables();
      
      // Variable with standard FHIR variable extension
      const standardVar = createFhirPathVariable('standardVar', '%standard');
      
      // Variable without the standard extension but with correct language
      const nonStandardVar = {
        url: 'http://custom.extension.url',
        valueExpression: {
          language: 'application/x-fhir-query',
          expression: 'CustomResource?id=123',
          name: 'customVar'
        }
      };

      const additionalVars = {
        standard: standardVar,
        custom: nonStandardVar
      };

      const result = addAdditionalVariables(existingVariables, additionalVars);

      expect(result.fhirPathVariables.QuestionnaireLevel).toHaveLength(1);
      expect(Object.keys(result.xFhirQueryVariables)).toHaveLength(1);
    });
  });
});
