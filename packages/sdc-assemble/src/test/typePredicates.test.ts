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
import type { Parameters, Questionnaire } from 'fhir/r4';
import { isInputParameters } from '../utils/typePredicates';
import type { InputParameters } from '../interfaces';

describe('isInputParameters', () => {
  it('should return true for valid InputParameters', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire', 
      id: 'test-questionnaire',
      status: 'draft'
    };

    const validParameters: Parameters = {
      resourceType: 'Parameters',
      parameter: [
        {
          name: 'questionnaire',
          resource: questionnaire
        }
      ]
    };

    const result = isInputParameters(validParameters);
    expect(result).toBe(true);
  });

  it('should return false when questionnaire parameter is missing', () => {
    const parametersWithoutQuestionnaire: Parameters = {
      resourceType: 'Parameters',
      parameter: [
        {
          name: 'other',
          valueString: 'some value'
        }
      ]
    };

    const result = isInputParameters(parametersWithoutQuestionnaire);
    expect(result).toBe(false);
  });

  it('should return false when questionnaire parameter has wrong resource type', () => {
    const parametersWithWrongResource: Parameters = {
      resourceType: 'Parameters',
      parameter: [
        {
          name: 'questionnaire',
          resource: {
            resourceType: 'Patient',
            id: 'patient-123'
          }
        }
      ]
    };

    const result = isInputParameters(parametersWithWrongResource);
    expect(result).toBe(false);
  });

  it('should return false when questionnaire parameter has no resource', () => {
    const parametersWithNoResource: Parameters = {
      resourceType: 'Parameters',
      parameter: [
        {
          name: 'questionnaire',
          valueString: 'not a resource'
        }
      ]
    };

    const result = isInputParameters(parametersWithNoResource);
    expect(result).toBe(false);
  });

  it('should return false when parameter array is empty', () => {
    const emptyParameters: Parameters = {
      resourceType: 'Parameters',
      parameter: []
    };

    const result = isInputParameters(emptyParameters);
    expect(result).toBe(false);
  });

  it('should return false when parameter array is undefined', () => {
    const noParametersArray: Parameters = {
      resourceType: 'Parameters'
      // No parameter property
    };

    const result = isInputParameters(noParametersArray);
    expect(result).toBe(false);
  });

  it('should return true when questionnaire parameter is present among other parameters', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'test-questionnaire',
      status: 'draft'
    };

    const mixedParameters: Parameters = {
      resourceType: 'Parameters',
      parameter: [
        {
          name: 'other',
          valueString: 'some value'
        },
        {
          name: 'questionnaire',
          resource: questionnaire
        },
        {
          name: 'another',
          valueBoolean: true
        }
      ]
    };

    const result = isInputParameters(mixedParameters);
    expect(result).toBe(true);
  });

  it('should return false when questionnaire parameter exists but resource is null', () => {
    const parametersWithNullResource: Parameters = {
      resourceType: 'Parameters',
      parameter: [
        {
          name: 'questionnaire',
          resource: null as unknown as Questionnaire
        }
      ]
    };

    const result = isInputParameters(parametersWithNullResource);
    expect(result).toBe(false);
  });

  it('should return false when questionnaire parameter exists but resource is undefined', () => {
    const parametersWithUndefinedResource: Parameters = {
      resourceType: 'Parameters',
      parameter: [
        {
          name: 'questionnaire'
          // No resource property
        }
      ]
    };

    const result = isInputParameters(parametersWithUndefinedResource);
    expect(result).toBe(false);
  });

  it('should work with proper type narrowing', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'type-test',
      status: 'draft'
    };

    const parameters: Parameters = {
      resourceType: 'Parameters',
      parameter: [
        {
          name: 'questionnaire',
          resource: questionnaire
        }
      ]
    };

    if (isInputParameters(parameters)) {
      // After type narrowing, parameters should be of type InputParameters
      const inputParams: InputParameters = parameters;
      expect(inputParams.parameter[0].name).toBe('questionnaire');
      expect(inputParams.parameter[0].resource.resourceType).toBe('Questionnaire');
    } else {
      fail('Type predicate should have returned true');
    }
  });
});
