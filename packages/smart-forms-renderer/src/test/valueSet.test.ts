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

import { beforeEach, describe, expect, jest } from '@jest/globals';
import type {
  Coding,
  Encounter,
  Expression,
  Patient,
  Practitioner,
  QuestionnaireItem,
  ValueSet
} from 'fhir/r4';
import {
  createValueSetToXFhirQueryVariableNameMap,
  evaluateAnswerExpressionValueSet,
  getCodingsForAnswerValueSet,
  getResourceFromLaunchContext,
  getTerminologyServerUrl,
  getValueSetCodings,
  getValueSetPromise,
  resolveValueSetPromises,
  validateCodePromise
} from '../utils/valueSet';
import type { VariableXFhirQuery } from '../interfaces/variables.interface';
import type { ValueSetPromise } from '../interfaces/valueSet.interface';
import { client } from 'fhirclient';
import { getRelevantCodingProperties } from '../utils/choice';

// Mock the fhirclient
jest.mock('fhirclient', () => ({
  client: jest.fn()
}));

// Mock the choice utility
jest.mock('../utils/choice', () => ({
  getRelevantCodingProperties: jest.fn()
}));

const mockClient = client as jest.MockedFunction<typeof client>;
const mockGetRelevantCodingProperties = getRelevantCodingProperties as jest.MockedFunction<
  typeof getRelevantCodingProperties
>;

describe('valueSet', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock for getRelevantCodingProperties
    mockGetRelevantCodingProperties.mockImplementation((coding) => coding as Coding);
  });

  describe('getTerminologyServerUrl', () => {
    it('should return terminology server URL from extension', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice',
        text: 'Test Item',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/terminology-server',
            valueUrl: 'https://tx.fhir.org/r4'
          }
        ]
      };

      const result = getTerminologyServerUrl(qItem);
      expect(result).toBe('https://tx.fhir.org/r4');
    });

    it('should return undefined when no terminology server extension exists', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice',
        text: 'Test Item',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/other-extension',
            valueString: 'other value'
          }
        ]
      };

      const result = getTerminologyServerUrl(qItem);
      expect(result).toBeUndefined();
    });

    it('should return undefined when no extensions exist', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice',
        text: 'Test Item'
      };

      const result = getTerminologyServerUrl(qItem);
      expect(result).toBeUndefined();
    });

    it('should return undefined when extensions array is empty', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'test-item',
        type: 'choice',
        text: 'Test Item',
        extension: []
      };

      const result = getTerminologyServerUrl(qItem);
      expect(result).toBeUndefined();
    });
  });

  describe('getValueSetPromise', () => {
    it('should make request to terminology server with standard URL', async () => {
      const mockRequest = jest.fn() as jest.MockedFunction<any>;
      mockRequest.mockResolvedValue({ mockValueSet: true });
      mockClient.mockReturnValue({ request: mockRequest } as any);

      const url = 'http://hl7.org/fhir/ValueSet/example';
      const terminologyServerUrl = 'https://tx.fhir.org/r4';

      await getValueSetPromise(url, terminologyServerUrl);

      expect(mockClient).toHaveBeenCalledWith({ serverUrl: terminologyServerUrl });
      expect(mockRequest).toHaveBeenCalledWith({
        url: 'ValueSet/$expand?url=' + url
      });
    });

    it('should handle URL with $expand format correctly', async () => {
      const mockRequest = jest.fn() as jest.MockedFunction<any>;
      mockRequest.mockResolvedValue({ mockValueSet: true });
      mockClient.mockReturnValue({ request: mockRequest } as any);

      const url =
        'https://tx.fhir.org/r4/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/example';
      const terminologyServerUrl = 'https://original-server.com/r4';

      await getValueSetPromise(url, terminologyServerUrl);

      expect(mockClient).toHaveBeenCalledWith({ serverUrl: 'https://tx.fhir.org/r4/' });
      expect(mockRequest).toHaveBeenCalledWith({
        url: 'ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/example'
      });
    });

    it('should handle URL with version parameter (pipe separator)', async () => {
      const mockRequest = jest.fn() as jest.MockedFunction<any>;
      mockRequest.mockResolvedValue({ mockValueSet: true });
      mockClient.mockReturnValue({ request: mockRequest } as any);

      const url = 'http://hl7.org/fhir/ValueSet/example|1.0.0';
      const terminologyServerUrl = 'https://tx.fhir.org/r4';

      await getValueSetPromise(url, terminologyServerUrl);

      expect(mockRequest).toHaveBeenCalledWith({
        url: 'ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/example&version=1.0.0'
      });
    });

    it('should handle incomplete $expand URL format gracefully', async () => {
      const mockRequest = jest.fn() as jest.MockedFunction<any>;
      mockRequest.mockResolvedValue({ mockValueSet: true });
      mockClient.mockReturnValue({ request: mockRequest } as any);

      const url = 'ValueSet/$expand?url='; // Missing actual URL
      const terminologyServerUrl = 'https://tx.fhir.org/r4';

      await getValueSetPromise(url, terminologyServerUrl);

      expect(mockClient).toHaveBeenCalledWith({ serverUrl: terminologyServerUrl });
      expect(mockRequest).toHaveBeenCalledWith({
        url: 'ValueSet/$expand?url=ValueSet/$expand?url=' // The function processes the URL and appends it
      });
    });
  });

  describe('validateCodePromise', () => {
    it('should validate code and return ValidateCodeResponse', async () => {
      const mockValidateCodeResponse = {
        resourceType: 'Parameters',
        parameter: [
          { name: 'code', valueCode: 'test-code' },
          { name: 'system', valueUri: 'http://test.system' },
          { name: 'display', valueString: 'Test Display' }
        ]
      };

      const mockRequest = jest.fn() as jest.MockedFunction<any>;
      mockRequest.mockResolvedValue(mockValidateCodeResponse);
      mockClient.mockReturnValue({ request: mockRequest } as any);

      const url = 'http://hl7.org/fhir/ValueSet/example';
      const system = 'http://test.system';
      const code = 'test-code';
      const terminologyServerUrl = 'https://tx.fhir.org/r4';

      const result = await validateCodePromise(url, system, code, terminologyServerUrl);

      expect(mockClient).toHaveBeenCalledWith({ serverUrl: terminologyServerUrl });
      expect(mockRequest).toHaveBeenCalledWith({
        url: `ValueSet/$validate-code?url=${url}&system=${system}&code=${code}`
      });
      expect(result).toEqual(mockValidateCodeResponse);
    });

    it('should return null for invalid response structure', async () => {
      const mockInvalidResponse = {
        resourceType: 'OperationOutcome',
        issue: [{ severity: 'error', code: 'invalid' }]
      };

      const mockRequest = jest.fn() as jest.MockedFunction<any>;
      mockRequest.mockResolvedValue(mockInvalidResponse);
      mockClient.mockReturnValue({ request: mockRequest } as any);

      const result = await validateCodePromise(
        'http://hl7.org/fhir/ValueSet/example',
        'http://test.system',
        'test-code',
        'https://tx.fhir.org/r4'
      );

      expect(result).toBeNull();
    });

    it('should return null for response missing required parameters', async () => {
      const mockIncompleteResponse = {
        resourceType: 'Parameters',
        parameter: [
          { name: 'code', valueCode: 'test-code' }
          // Missing system and display parameters
        ]
      };

      const mockRequest = jest.fn() as jest.MockedFunction<any>;
      mockRequest.mockResolvedValue(mockIncompleteResponse);
      mockClient.mockReturnValue({ request: mockRequest } as any);

      const result = await validateCodePromise(
        'http://hl7.org/fhir/ValueSet/example',
        'http://test.system',
        'test-code',
        'https://tx.fhir.org/r4'
      );

      expect(result).toBeNull();
    });

    it('should return null when response is null', async () => {
      const mockRequest = jest.fn() as jest.MockedFunction<any>;
      mockRequest.mockResolvedValue(null);
      mockClient.mockReturnValue({ request: mockRequest } as any);

      const result = await validateCodePromise(
        'http://hl7.org/fhir/ValueSet/example',
        'http://test.system',
        'test-code',
        'https://tx.fhir.org/r4'
      );

      expect(result).toBeNull();
    });
  });

  describe('resolveValueSetPromises', () => {
    it('should resolve fulfilled promises and return ValueSetPromises', async () => {
      const mockValueSet1: ValueSet = {
        resourceType: 'ValueSet',
        status: 'active',
        id: 'valueset-1'
      };

      const mockValueSet2: ValueSet = {
        resourceType: 'ValueSet',
        status: 'active',
        id: 'valueset-2'
      };

      const valueSetPromises: Record<string, ValueSetPromise> = {
        vs1: {
          promise: Promise.resolve(mockValueSet1)
        },
        vs2: {
          promise: Promise.resolve(mockValueSet2)
        }
      };

      const result = await resolveValueSetPromises(valueSetPromises);

      expect(Object.keys(result)).toHaveLength(2);
      expect(result['vs1'].valueSet).toEqual(mockValueSet1);
      expect(result['vs2'].valueSet).toEqual(mockValueSet2);
    });

    it('should handle rejected promises gracefully', async () => {
      const mockValueSet: ValueSet = {
        resourceType: 'ValueSet',
        status: 'active',
        id: 'valueset-1'
      };

      const valueSetPromises: Record<string, ValueSetPromise> = {
        vs1: {
          promise: Promise.resolve(mockValueSet)
        },
        vs2: {
          promise: Promise.reject(new Error('Network error'))
        }
      };

      const result = await resolveValueSetPromises(valueSetPromises);

      expect(Object.keys(result)).toHaveLength(1);
      expect(result['vs1'].valueSet).toEqual(mockValueSet);
      expect(result['vs2']).toBeUndefined(); // Rejected promise should not be included
    });

    it('should handle timeout promises', async () => {
      const slowPromise = new Promise<ValueSet>((resolve) => {
        setTimeout(() => resolve({ resourceType: 'ValueSet', status: 'active' } as ValueSet), 6000); // 6 seconds (longer than 5s timeout)
      });

      const valueSetPromises: Record<string, ValueSetPromise> = {
        slow: {
          promise: slowPromise
        }
      };

      const result = await resolveValueSetPromises(valueSetPromises);

      expect(Object.keys(result)).toHaveLength(0); // Should timeout and not be included
    }, 10000); // Set test timeout to 10 seconds

    it('should handle empty valueSetPromises object', async () => {
      const result = await resolveValueSetPromises({});
      expect(result).toEqual({});
    });

    it('should handle promise resolution with proper keys and values', async () => {
      const mockValueSet: ValueSet = {
        resourceType: 'ValueSet',
        status: 'active',
        id: 'valueset-1'
      };

      const valueSetPromises: Record<string, ValueSetPromise> = {
        vs1: {
          promise: Promise.resolve(mockValueSet)
        }
      };

      const result = await resolveValueSetPromises(valueSetPromises);

      expect(Object.keys(result)).toHaveLength(1);
      expect(result['vs1'].valueSet).toEqual(mockValueSet);
    });
  });

  describe('getValueSetCodings', () => {
    it('should extract codings from valueSet expansion', () => {
      const mockCoding1: Coding = {
        system: 'http://test.system',
        code: 'code1',
        display: 'Display 1'
      };

      const mockCoding2: Coding = {
        system: 'http://test.system',
        code: 'code2',
        display: 'Display 2'
      };

      const valueSet: ValueSet = {
        resourceType: 'ValueSet',
        status: 'active',
        expansion: {
          timestamp: '2023-01-01T00:00:00Z',
          contains: [mockCoding1, mockCoding2]
        }
      };

      mockGetRelevantCodingProperties
        .mockReturnValueOnce(mockCoding1)
        .mockReturnValueOnce(mockCoding2);

      const result = getValueSetCodings(valueSet);

      expect(result).toEqual([mockCoding1, mockCoding2]);
      expect(mockGetRelevantCodingProperties).toHaveBeenCalledTimes(2);
      expect(mockGetRelevantCodingProperties).toHaveBeenCalledWith(mockCoding1);
      expect(mockGetRelevantCodingProperties).toHaveBeenCalledWith(mockCoding2);
    });

    it('should return empty array when expansion is undefined', () => {
      const valueSet: ValueSet = {
        resourceType: 'ValueSet',
        status: 'active'
      };

      const result = getValueSetCodings(valueSet);
      expect(result).toEqual([]);
    });

    it('should return empty array when expansion.contains is undefined', () => {
      const valueSet: ValueSet = {
        resourceType: 'ValueSet',
        status: 'active',
        expansion: {
          timestamp: '2023-01-01T00:00:00Z'
        }
      };

      const result = getValueSetCodings(valueSet);
      expect(result).toEqual([]);
    });

    it('should return empty array when expansion.contains is empty', () => {
      const valueSet: ValueSet = {
        resourceType: 'ValueSet',
        status: 'active',
        expansion: {
          timestamp: '2023-01-01T00:00:00Z',
          contains: []
        }
      };

      const result = getValueSetCodings(valueSet);
      expect(result).toEqual([]);
    });
  });

  describe('evaluateAnswerExpressionValueSet', () => {
    it('should return codings for valid variable and value set expression', () => {
      const answerExpression: Expression = {
        language: 'text/fhirpath',
        expression: '%vs.select(code)'
      };

      const itemLevelVariables: Expression[] = [
        {
          name: 'vs',
          language: 'text/fhirpath',
          expression: 'http://hl7.org/fhir/ValueSet/example'
        }
      ];

      const mockCodings: Coding[] = [
        { system: 'http://test.system', code: 'code1', display: 'Display 1' },
        { system: 'http://test.system', code: 'code2', display: 'Display 2' }
      ];

      const preprocessedCodings: Record<string, Coding[]> = {
        'http://hl7.org/fhir/ValueSet/example': mockCodings
      };

      const result = evaluateAnswerExpressionValueSet(
        answerExpression,
        itemLevelVariables,
        preprocessedCodings
      );

      expect(result).toEqual(mockCodings);
    });

    it('should return empty array when expression is undefined', () => {
      const answerExpression: Expression = {
        language: 'text/fhirpath'
        // No expression property
      };

      const result = evaluateAnswerExpressionValueSet(answerExpression, [], {});
      expect(result).toEqual([]);
    });

    it('should return empty array when variable name cannot be extracted', () => {
      const answerExpression: Expression = {
        language: 'text/fhirpath',
        expression: 'invalid.expression'
      };

      const result = evaluateAnswerExpressionValueSet(answerExpression, [], {});
      expect(result).toEqual([]);
    });

    it('should return empty array when variable is not found', () => {
      const answerExpression: Expression = {
        language: 'text/fhirpath',
        expression: '%nonexistent.select(code)'
      };

      const itemLevelVariables: Expression[] = [
        {
          name: 'vs',
          language: 'text/fhirpath',
          expression: 'http://hl7.org/fhir/ValueSet/example'
        }
      ];

      const result = evaluateAnswerExpressionValueSet(answerExpression, itemLevelVariables, {});
      expect(result).toEqual([]);
    });

    it('should return empty array when matched variable has no expression', () => {
      const answerExpression: Expression = {
        language: 'text/fhirpath',
        expression: '%vs.select(code)'
      };

      const itemLevelVariables: Expression[] = [
        {
          name: 'vs',
          language: 'text/fhirpath'
          // No expression property
        }
      ];

      const result = evaluateAnswerExpressionValueSet(answerExpression, itemLevelVariables, {});
      expect(result).toEqual([]);
    });

    it('should return empty array when variable expression is not a valid ValueSet URL', () => {
      const answerExpression: Expression = {
        language: 'text/fhirpath',
        expression: '%vs.select(code)'
      };

      const itemLevelVariables: Expression[] = [
        {
          name: 'vs',
          language: 'text/fhirpath',
          expression: 'invalid-url'
        }
      ];

      const result = evaluateAnswerExpressionValueSet(answerExpression, itemLevelVariables, {});
      expect(result).toEqual([]);
    });

    it('should return empty array when ValueSet URL is not in preprocessed codings', () => {
      const answerExpression: Expression = {
        language: 'text/fhirpath',
        expression: '%vs.select(code)'
      };

      const itemLevelVariables: Expression[] = [
        {
          name: 'vs',
          language: 'text/fhirpath',
          expression: 'http://hl7.org/fhir/ValueSet/example'
        }
      ];

      const preprocessedCodings: Record<string, Coding[]> = {
        'http://hl7.org/fhir/ValueSet/different': []
      };

      const result = evaluateAnswerExpressionValueSet(
        answerExpression,
        itemLevelVariables,
        preprocessedCodings
      );
      expect(result).toEqual([]);
    });

    it('should handle itemLevelVariables being undefined', () => {
      const answerExpression: Expression = {
        language: 'text/fhirpath',
        expression: '%vs.select(code)'
      };

      const result = evaluateAnswerExpressionValueSet(answerExpression, undefined as any, {});
      expect(result).toEqual([]);
    });
  });

  describe('createValueSetToXFhirQueryVariableNameMap', () => {
    it('should create mapping from ValueSet URLs to variable names', () => {
      const variables: Record<string, VariableXFhirQuery> = {
        vs1: {
          valueExpression: {
            language: 'text/fhirpath',
            expression: 'http://hl7.org/fhir/ValueSet/example1'
          }
        },
        vs2: {
          valueExpression: {
            language: 'text/fhirpath',
            expression: 'http://hl7.org/fhir/ValueSet/example2'
          }
        },
        nonValueSet: {
          valueExpression: {
            language: 'text/fhirpath',
            expression: 'Patient.identifier'
          }
        }
      };

      const result = createValueSetToXFhirQueryVariableNameMap(variables);

      expect(result).toEqual({
        'http://hl7.org/fhir/ValueSet/example1': 'vs1',
        'http://hl7.org/fhir/ValueSet/example2': 'vs2'
      });
    });

    it('should handle variables with no expression', () => {
      const variables: Record<string, VariableXFhirQuery> = {
        vs1: {
          valueExpression: {
            language: 'text/fhirpath'
            // No expression property
          }
        }
      };

      const result = createValueSetToXFhirQueryVariableNameMap(variables);
      expect(result).toEqual({});
    });

    it('should handle empty variables object', () => {
      const result = createValueSetToXFhirQueryVariableNameMap({});
      expect(result).toEqual({});
    });

    it('should handle variables with invalid ValueSet URLs', () => {
      const variables: Record<string, VariableXFhirQuery> = {
        invalid1: {
          valueExpression: {
            language: 'text/fhirpath',
            expression: 'not-a-valueset-url'
          }
        },
        invalid2: {
          valueExpression: {
            language: 'text/fhirpath',
            expression: 'http://example.com/not-valueset'
          }
        }
      };

      const result = createValueSetToXFhirQueryVariableNameMap(variables);
      expect(result).toEqual({});
    });
  });

  describe('getResourceFromLaunchContext', () => {
    const mockPatient: Patient = {
      resourceType: 'Patient',
      id: 'patient-1',
      name: [{ family: 'Doe', given: ['John'] }]
    };

    const mockPractitioner: Practitioner = {
      resourceType: 'Practitioner',
      id: 'practitioner-1',
      name: [{ family: 'Smith', given: ['Jane'] }]
    };

    const mockEncounter: Encounter = {
      resourceType: 'Encounter',
      id: 'encounter-1',
      status: 'in-progress',
      class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'AMB' }
    };

    it('should return Patient resource when resourceType is Patient', () => {
      const result = getResourceFromLaunchContext(
        'Patient',
        mockPatient,
        mockPractitioner,
        mockEncounter
      );
      expect(result).toEqual(mockPatient);
    });

    it('should return Practitioner resource when resourceType is Practitioner', () => {
      const result = getResourceFromLaunchContext(
        'Practitioner',
        mockPatient,
        mockPractitioner,
        mockEncounter
      );
      expect(result).toEqual(mockPractitioner);
    });

    it('should return Encounter resource when resourceType is Encounter', () => {
      const result = getResourceFromLaunchContext(
        'Encounter',
        mockPatient,
        mockPractitioner,
        mockEncounter
      );
      expect(result).toEqual(mockEncounter);
    });

    it('should return null when resourceType is not Patient, Practitioner, or Encounter', () => {
      const result = getResourceFromLaunchContext(
        'Observation' as any,
        mockPatient,
        mockPractitioner,
        mockEncounter
      );
      expect(result).toBeNull();
    });

    it('should return null when requested resource is null', () => {
      const result = getResourceFromLaunchContext('Patient', null, mockPractitioner, mockEncounter);
      expect(result).toBeNull();
    });

    it('should handle null parameters gracefully', () => {
      const result = getResourceFromLaunchContext('Patient', null, null, null);
      expect(result).toBeNull();
    });
  });
});

describe('getCodingsForAnswerValueSet', () => {
  const codingA: Coding = { system: 'http://loinc.org', code: '1234-5', display: 'Test A' };
  const codingB: Coding = { system: 'http://snomed.info/sct', code: '67890', display: 'Test B' };

  it('returns [] when answerValueSetUrl is undefined', () => {
    const result = getCodingsForAnswerValueSet(undefined, { myVS: [codingA] }, {});
    expect(result).toEqual([]);
  });

  it('returns codings for contained reference (#)', () => {
    const result = getCodingsForAnswerValueSet('#myVS', { myVS: [codingA] }, {});
    expect(result).toEqual([codingA]);
  });

  it('returns [] when contained reference does not exist in cache', () => {
    const result = getCodingsForAnswerValueSet('#missingVS', {}, {});
    expect(result).toEqual([]);
  });

  it('uses updatableValueSetUrl if provided', () => {
    const result = getCodingsForAnswerValueSet(
      'http://example.org/vs',
      { 'http://updated.org/vs': [codingB] },
      {
        'http://example.org/vs': {
          initialValueSetUrl: 'http://example.org/vs',
          updatableValueSetUrl: 'http://updated.org/vs',
          bindingParameters: [],
          isDynamic: true,
          linkIds: []
        }
      }
    );
    expect(result).toEqual([codingB]);
  });

  it('returns codings directly from cachedValueSetCodings if found', () => {
    const result = getCodingsForAnswerValueSet(
      'http://direct.org/vs',
      { 'http://direct.org/vs': [codingA, codingB] },
      {}
    );
    expect(result).toEqual([codingA, codingB]);
  });

  it('returns [] if nothing is found in any cache', () => {
    const result = getCodingsForAnswerValueSet('http://unknown.org/vs', {}, {});
    expect(result).toEqual([]);
  });
});
