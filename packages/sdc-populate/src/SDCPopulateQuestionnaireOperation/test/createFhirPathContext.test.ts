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

import {
  createFhirPathContext,
  evaluateFhirPathEmbeddings,
  evaluateFhirPathVariables,
  extractAndEvaluateFhirPathVariables,
  extractItemLevelFhirPathVariables,
  extractItemLevelFhirPathVariablesRecursive,
  getContainedBatchContexts,
  getFhirPathEmbeddings,
  getFhirPathVariables,
  handleFhirPathResult,
  populateBatchContextsIntoContextMap,
  populateReferenceContextsIntoContextMap,
  readFhirPathEmbeddingsFromStr,
  replaceEvaluatedFhirPathEmbeddingsInContexts,
  replaceFhirPathEmbeddings,
  responseDataIsFhirResource
} from '../utils/createFhirPathContext';
import type {
  InputParameters,
  ReferenceContext,
  ResourceContext
} from '../interfaces/inputParameters.interface';
import { expect } from '@jest/globals';
import type {
  Bundle,
  Encounter,
  Expression,
  Extension,
  OperationOutcome,
  OperationOutcomeIssue,
  Patient,
  Practitioner,
  Questionnaire,
  QuestionnaireItem
} from 'fhir/r4';
import { createNotFoundWarningIssue } from '../utils/operationOutcome';
import { ContainedBatchContextsTestFhirContext } from './resources/ContainedBatchContextsTestFhirContext';
import { ReferencedContextsTestFhirContext } from './resources/ReferencedContextsTestFhirContext';
import { QTestFhirContext } from './resources/QTestFhirContext';
import { createReferenceContextTuple } from '../utils/createContextTuples';

const mockFetchResourceCallback = jest.fn();
const mockFetchResourceCallbackConfig = {
  sourceServerUrl: 'https://example.com/fhir'
};

const terminologyServerUrl = 'https://example.com/terminology/fhir';

// Mock createReferenceContextTuple function
jest.mock('../utils/createContextTuples', () => {
  const actual = jest.requireActual('../utils/createContextTuples');
  return {
    ...actual,
    createReferenceContextTuple: jest.fn() // only createReferenceContextTuple is mocked
  };
});

const questionnaire = QTestFhirContext;

const referenceContexts: ReferenceContext[] = ReferencedContextsTestFhirContext;

const containedBatchContexts: ResourceContext[] = ContainedBatchContextsTestFhirContext;

const mockPatient: Patient = {
  resourceType: 'Patient',
  id: 'patient-123',
  name: [{ text: 'John Doe' }],
  birthDate: '1970-01-01'
};

const mockUser: Practitioner = {
  resourceType: 'Practitioner',
  id: 'practitioner-456',
  name: [{ text: 'Dr. Smith' }]
};

const mockEncounter: Encounter = {
  resourceType: 'Encounter',
  id: 'encounter-789',
  status: 'in-progress',
  class: {
    system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
    code: 'AMB',
    display: 'ambulatory'
  }
};

const mockObservationHeight = {
  resourceType: 'Observation',
  id: 'height1',
  code: { coding: [{ code: '8302-2' }] },
  valueQuantity: { value: 180, unit: 'cm' }
};

const mockObservationWeight = {
  resourceType: 'Observation',
  id: 'weight1',
  code: { coding: [{ code: '29463-7' }] },
  valueQuantity: { value: 75, unit: 'kg' }
};

describe('createFhirPathContext', () => {
  it('should create a valid FHIRPath context with all expected keys', async () => {
    const launchContexts = [
      {
        name: 'context',
        part: [
          { name: 'name', valueString: 'patient' },
          { name: 'content', resource: mockPatient }
        ]
      }
    ];

    const parameters = {
      resourceType: 'Parameters',
      parameter: [...launchContexts, ...referenceContexts, ...containedBatchContexts]
    } as InputParameters;
    const issues: OperationOutcomeIssue[] = [];

    const emptyResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress'
    };

    (createReferenceContextTuple as jest.Mock).mockImplementation((referenceContext) => {
      const name = referenceContext.part[0]?.valueString;
      const mockResources: Record<string, any> = {
        ObsBodyHeight: Promise.resolve(mockObservationHeight),
        ObsBodyWeight: Promise.resolve(mockObservationWeight)
      };
      return [referenceContext, mockResources[name]];
    });

    const context = await createFhirPathContext(
      parameters,
      questionnaire,
      mockFetchResourceCallback,
      mockFetchResourceCallbackConfig,
      issues
    );

    expect(context).toBeDefined();
    expect(context.resource).toEqual(emptyResponse);
    expect(context.rootResource).toEqual(emptyResponse);
    expect(context.patient).toEqual(mockPatient);
    expect(context.PrePopQuery).toEqual({
      resourceType: 'Bundle',
      id: 'PrePopQuery',
      type: 'batch',
      entry: [
        {
          fullUrl: 'urn:uuid:38a25157-b8e4-42e4-9525-7954fed52573',
          request: { method: 'GET', url: 'AllergyIntolerance?patient=patient-123' }
        },
        {
          fullUrl: 'urn:uuid:38a25157-b8e4-42e4-9525-7954fed52575',
          request: { method: 'GET', url: 'Condition?patient=patient-123' }
        }
      ]
    });

    expect(context.ObsBodyHeight).toEqual(mockObservationHeight);
    expect(context.ObsBodyWeight).toEqual(mockObservationWeight);
  });
});

describe('extractAndEvaluateFhirPathVariables', () => {
  it('evaluates both questionnaire and item-level variables', async () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'quesVar',
            language: 'text/fhirpath',
            expression: 'true'
          }
        }
      ],
      item: [
        {
          linkId: 'q1',
          type: 'string',
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/variable',
              valueExpression: {
                name: 'q1Var',
                language: 'text/fhirpath',
                expression: '1 + 1'
              }
            }
          ]
        }
      ]
    };

    const fhirPathContext: Record<string, any> = {};
    const issues: OperationOutcomeIssue[] = [];

    await extractAndEvaluateFhirPathVariables(questionnaire, fhirPathContext, issues);

    expect(fhirPathContext.quesVar).toStrictEqual([true]);
    expect(fhirPathContext.q1Var).toStrictEqual([2]);
    expect(issues).toEqual([]);
  });

  it('skips evaluation if no extensions exist', async () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft',
      item: []
    };

    const fhirPathContext: Record<string, any> = {};
    const issues: OperationOutcomeIssue[] = [];

    await extractAndEvaluateFhirPathVariables(questionnaire, fhirPathContext, issues);

    expect(fhirPathContext).toStrictEqual({});
    expect(issues).toEqual([]);
  });
});

describe('extractItemLevelFhirPathVariables', () => {
  it('should extract FHIRPath variables from nested questionnaire items', () => {
    const expression: Expression = {
      name: 'patientBirthDate',
      language: 'text/fhirpath',
      expression: '%patient.birthDate'
    };

    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft',
      item: [
        {
          linkId: '1',
          text: 'Top Level Group',
          type: 'group',
          repeats: true,
          item: [
            {
              linkId: '1.1',
              text: 'Child item',
              type: 'string',
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/variable',
                  valueExpression: expression
                }
              ]
            }
          ]
        }
      ]
    };

    const result = extractItemLevelFhirPathVariables(questionnaire, {});
    expect(result).toEqual({
      '1.1': [expression]
    });
  });

  it('should return original variables if questionnaire has no items', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'draft'
    };

    const input = { existing: [] };
    const result = extractItemLevelFhirPathVariables(questionnaire, input);
    expect(result).toBe(input);
  });
});

describe('extractItemLevelFhirPathVariablesRecursive', () => {
  const expression: Expression = {
    name: 'patientBirthDate',
    language: 'text/fhirpath',
    expression: '%patient.birthDate'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should extract variables from a single item with extensions', () => {
    const item: QuestionnaireItem = {
      linkId: 'q1',
      type: 'string',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: expression
        }
      ]
    };

    const result = extractItemLevelFhirPathVariablesRecursive({
      item,
      variables: {},
      parentRepeatGroupLinkId: undefined
    });

    expect(result.variables).toEqual({
      q1: [expression]
    });
  });

  it('should recursively extract variables from nested child items', () => {
    const nestedItem: QuestionnaireItem = {
      linkId: 'q2',
      type: 'string',
      extension: [
        { url: 'http://hl7.org/fhir/StructureDefinition/variable', valueExpression: expression }
      ]
    };

    const parentItem: QuestionnaireItem = {
      linkId: 'group1',
      type: 'group',
      item: [nestedItem]
    };

    const result = extractItemLevelFhirPathVariablesRecursive({
      item: parentItem,
      variables: {},
      parentRepeatGroupLinkId: undefined
    });

    expect(result.variables).toEqual({
      q2: [expression]
    });
  });

  it('should track parentRepeatGroupLinkId correctly when item is a repeating group', () => {
    const childItem: QuestionnaireItem = {
      linkId: 'child1',
      type: 'string',
      extension: [
        { url: 'http://hl7.org/fhir/StructureDefinition/variable', valueExpression: expression }
      ]
    };

    const repeatGroupItem: QuestionnaireItem = {
      linkId: 'repeatGroup',
      type: 'group',
      repeats: true,
      item: [childItem]
    };

    const result = extractItemLevelFhirPathVariablesRecursive({
      item: repeatGroupItem,
      variables: {},
      parentRepeatGroupLinkId: undefined
    });

    expect(result.variables).toEqual({
      child1: [expression]
    });
  });

  it('should return empty variables if no extensions are present', () => {
    const item: QuestionnaireItem = {
      linkId: 'q3',
      type: 'string'
    };

    const result = extractItemLevelFhirPathVariablesRecursive({
      item,
      variables: {},
      parentRepeatGroupLinkId: undefined
    });

    expect(result.variables).toEqual({});
  });
});

describe('evaluateFhirPathVariables', () => {
  it('evaluates a FHIRPath variable and updates context', async () => {
    const expressions: Expression[] = [
      {
        name: 'patientBirthDate',
        language: 'text/fhirpath',
        expression: '%patient.birthDate'
      }
    ];

    const fhirPathContext: Record<string, any> = {
      patient: {
        birthDate: '1970-01-01'
      }
    };
    const issues: OperationOutcomeIssue[] = [];

    await evaluateFhirPathVariables(expressions, fhirPathContext, issues, {
      terminologyServerUrl: terminologyServerUrl
    });

    expect(fhirPathContext.patientBirthDate).toStrictEqual(['1970-01-01']);
    expect(issues).toHaveLength(0);
  });

  it('return empty result when variable cannot be resolved from fhirPathContext', async () => {
    const expressions: Expression[] = [];
    const fhirPathContext: Record<string, any> = {
      patient: {
        name: [{ text: 'John Doe' }]
      }
    };
    const issues: OperationOutcomeIssue[] = [];

    await evaluateFhirPathVariables(expressions, fhirPathContext, issues, {
      terminologyServerUrl: terminologyServerUrl
    });

    expect(fhirPathContext.patientBirthDate).toBe(undefined);
    expect(issues).toHaveLength(0);
  });

  it('adds issue when expression cannot be parsed', async () => {
    const expressions: Expression[] = [
      {
        name: 'patientBirthDate',
        language: 'text/fhirpath',
        expression: '%patient.birthDate.where('
      }
    ];
    const fhirPathContext: Record<string, any> = {};
    const issues: OperationOutcomeIssue[] = [];

    await evaluateFhirPathVariables(expressions, fhirPathContext, issues, {
      terminologyServerUrl: terminologyServerUrl
    });

    expect(fhirPathContext.patientBirthDate).toBe(undefined);
    expect(issues).toHaveLength(1);
    expect(issues[0].details.text).toContain('Error:');
  });
});

describe('getFhirPathVariables', () => {
  it('returns only FHIRPath variables with correct url and language', () => {
    const extensions: Extension[] = [
      {
        url: 'http://hl7.org/fhir/StructureDefinition/variable',
        valueExpression: {
          language: 'text/fhirpath',
          expression: '%patient.birthDate',
          name: 'birthDateVar'
        }
      },
      {
        url: 'http://hl7.org/fhir/StructureDefinition/variable',
        valueExpression: {
          language: 'application/x-fhir-query',
          expression: 'Observation?code=1234',
          name: 'obsQuery'
        }
      },
      {
        url: 'http://hl7.org/fhir/StructureDefinition/other',
        valueExpression: {
          language: 'text/fhirpath',
          expression: 'something.else',
          name: 'notAVariable'
        }
      }
    ];

    const result = getFhirPathVariables(extensions);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      language: 'text/fhirpath',
      expression: '%patient.birthDate',
      name: 'birthDateVar'
    });
  });

  it('returns an empty array if no matching extensions', () => {
    const extensions: Extension[] = [
      {
        url: 'http://hl7.org/fhir/StructureDefinition/other',
        valueExpression: {
          language: 'application/x-fhir-query',
          expression: 'foo'
        }
      }
    ];

    const result = getFhirPathVariables(extensions);

    expect(result).toEqual([]);
  });

  it('ignores extensions without valueExpression', () => {
    const extensions: Extension[] = [
      {
        url: 'http://hl7.org/fhir/StructureDefinition/variable'
      }
    ];

    const result = getFhirPathVariables(extensions);

    expect(result).toEqual([]);
  });
});

describe('populateReferenceContextsIntoContextMap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds resolved resources to contextMap', async () => {
    const contextMap: Record<string, any> = {};
    const issues: any[] = [];

    (createReferenceContextTuple as jest.Mock).mockImplementation((referenceContext) => {
      const name = referenceContext.part[0]?.valueString;
      const mockResources: Record<string, any> = {
        ObsBodyHeight: Promise.resolve(mockObservationHeight),
        ObsBodyWeight: Promise.resolve(mockObservationWeight),
        PrePopQuery: Promise.resolve({ resourceType: 'Bundle', id: 'PrePopQuery', entry: [] })
      };
      return [referenceContext, mockResources[name]];
    });

    await populateReferenceContextsIntoContextMap(
      referenceContexts,
      contextMap,
      mockFetchResourceCallback,
      mockFetchResourceCallbackConfig,
      issues
    );

    expect(contextMap['ObsBodyHeight']).toEqual(mockObservationHeight);
    expect(contextMap['ObsBodyWeight']).toEqual(mockObservationWeight);
    expect(contextMap['PrePopQuery']).toEqual({
      resourceType: 'Bundle',
      id: 'PrePopQuery',
      entry: []
    });
    expect(issues).toHaveLength(0);
  });

  it('adds not-found warning if resource is null', async () => {
    const contextMap: Record<string, any> = {};
    const issues: OperationOutcomeIssue[] = [];

    (createReferenceContextTuple as jest.Mock).mockImplementation((referenceContext) => {
      return [referenceContext, Promise.resolve(null)];
    });

    // (responseDataIsFhirResource as jest.Mock).mockImplementation(() => false);

    await populateReferenceContextsIntoContextMap(
      [referenceContexts[0]], // Only one to test
      contextMap,
      mockFetchResourceCallback,
      mockFetchResourceCallbackConfig,
      issues
    );

    expect(contextMap['ObsBodyHeight']).toBeUndefined();
    expect(issues[0].details.text).toContain('Cannot read properties of null');
  });

  it('adds OperationOutcome issues if resource is OperationOutcome', async () => {
    const contextMap: Record<string, any> = {};
    const issues: OperationOutcomeIssue[] = [];

    const opOutcome = {
      resourceType: 'OperationOutcome',
      issue: [{ severity: 'error', diagnostics: 'Something went wrong' }]
    };

    (createReferenceContextTuple as jest.Mock).mockImplementation((referenceContext) => {
      return [referenceContext, Promise.resolve(opOutcome)];
    });

    // (responseDataIsFhirResource as jest.Mock).mockImplementation(() => true);

    await populateReferenceContextsIntoContextMap(
      [referenceContexts[0]],
      contextMap,
      mockFetchResourceCallback,
      mockFetchResourceCallbackConfig,
      issues
    );

    expect(contextMap['ObsBodyHeight']).toBeUndefined();
    expect(issues[0].diagnostics).toBe('Something went wrong');
  });
});

describe('populateBatchContextsIntoContextMap', () => {
  let issues: any[];
  let contextMap: Record<string, any>;
  let fetchResourceCallback: jest.Mock;

  beforeEach(() => {
    issues = [];
    contextMap = {};
    fetchResourceCallback = jest.fn();
  });

  it('should populate contextMap with resolved FHIR resources', async () => {
    fetchResourceCallback
      .mockResolvedValueOnce({ data: { resourceType: 'AllergyIntolerance', id: 'a1' } })
      .mockResolvedValueOnce({ data: { resourceType: 'Condition', id: 'c1' } });

    await populateBatchContextsIntoContextMap(
      containedBatchContexts,
      contextMap,
      fetchResourceCallback,
      mockFetchResourceCallbackConfig,
      issues
    );

    expect(Object.keys(contextMap)).toContain('PrePopQuery');

    const bundle: Bundle = contextMap['PrePopQuery'];
    expect(bundle.entry[0].resource).toEqual({ resourceType: 'AllergyIntolerance', id: 'a1' });
    expect(bundle.entry[1].resource).toEqual({ resourceType: 'Condition', id: 'c1' });

    expect(issues).toHaveLength(0);
  });

  it('should push warning if response is null', async () => {
    fetchResourceCallback.mockResolvedValueOnce({ data: null });

    await populateBatchContextsIntoContextMap(
      containedBatchContexts,
      contextMap,
      fetchResourceCallback,
      mockFetchResourceCallbackConfig,
      issues
    );

    expect(issues).toContainEqual(
      createNotFoundWarningIssue('The resource for PrePopQuery entry 0 could not be resolved.')
    );
  });

  it('should extract issues from OperationOutcome responses', async () => {
    const oo: OperationOutcome = {
      resourceType: 'OperationOutcome',
      issue: [{ severity: 'warning', code: 'processing', diagnostics: 'Example warning' }]
    };

    fetchResourceCallback
      .mockResolvedValueOnce({ data: oo })
      .mockResolvedValueOnce({ data: { resourceType: 'Condition', id: 'c1' } });

    await populateBatchContextsIntoContextMap(
      containedBatchContexts,
      contextMap,
      fetchResourceCallback,
      mockFetchResourceCallbackConfig,
      issues
    );

    expect(issues).toContainEqual(oo.issue[0]);
  });

  it('should push warning if promise is rejected', async () => {
    fetchResourceCallback
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockResolvedValueOnce({ data: { resourceType: 'Condition', id: 'c1' } });

    await populateBatchContextsIntoContextMap(
      containedBatchContexts,
      contextMap,
      fetchResourceCallback,
      mockFetchResourceCallbackConfig,
      issues
    );

    expect(issues).toContainEqual(
      createNotFoundWarningIssue('The resource for PrePopQuery entry 0 could not be resolved.')
    );
  });

  it('should skip empty batch bundles', async () => {
    const emptyBatchContext: ResourceContext[] = [
      {
        name: 'context',
        part: [
          { name: 'name', valueString: 'EmptyBatch' },
          {
            name: 'content',
            resource: {
              resourceType: 'Bundle',
              type: 'batch',
              entry: []
            }
          }
        ]
      }
    ];

    await populateBatchContextsIntoContextMap(
      emptyBatchContext,
      contextMap,
      fetchResourceCallback,
      mockFetchResourceCallbackConfig,
      issues
    );

    expect(contextMap).toEqual({});
    expect(issues).toEqual([]);
    expect(fetchResourceCallback).not.toHaveBeenCalled();
  });
});

describe('responseDataIsFhirResource', () => {
  it('should return true for valid FHIR resource', () => {
    const resource = { resourceType: 'Patient', id: '123' };
    expect(responseDataIsFhirResource(resource)).toBe(true);
  });

  it('should return false for missing resourceType', () => {
    const resource = { id: '123' };
    expect(responseDataIsFhirResource(resource)).toBe(false);
  });

  it('should return false if resourceType is not a string', () => {
    const resource = { resourceType: 123, id: '123' };
    expect(responseDataIsFhirResource(resource)).toBe(false);
  });

  it('should return false for null or undefined input', () => {
    expect(responseDataIsFhirResource(null)).toBe(false);
    expect(responseDataIsFhirResource(undefined)).toBe(false);
  });
});

describe('replaceFhirPathEmbeddings', () => {
  const launchContexts = [
    {
      name: 'context',
      part: [
        { name: 'name', valueString: 'patient' },
        { name: 'content', resource: mockPatient }
      ]
    }
  ];

  const parameters = {
    resourceType: 'Parameters',
    parameter: [...launchContexts, ...referenceContexts]
  } as InputParameters;

  it('should evaluate and replace FHIRPath embeddings', async () => {
    const result = await replaceFhirPathEmbeddings(parameters, questionnaire);

    // Check launchContexts
    expect(result.launchContexts).toHaveLength(1);

    // Updated referenceContexts should have resolved patient.id substitutions
    const updatedRefQuery = result.updatedReferenceContexts[0].part[1].valueReference.reference;
    expect(updatedRefQuery).not.toContain('{{%patient.id}}');
    expect(updatedRefQuery).toMatch(/patient=patient-123/);

    const containedBundle = result.updatedContainedBatchContexts[0].part[1].resource as Bundle;
    expect(containedBundle.resourceType).toBe('Bundle');
    const updatedContainedEntry = containedBundle.entry[0];
    expect(updatedContainedEntry.request.url).not.toContain('{{%patient.id}}');
    expect(updatedContainedEntry.request.url).toMatch(/patient=patient-123/);
  });
});

describe('getContainedBatchContexts', () => {
  it('extracts contained batch contexts from referenceContexts and questionnaire.contained', () => {
    const result = getContainedBatchContexts(
      [
        {
          name: 'context',
          part: [
            { name: 'name', valueString: 'PrePopQuery' },
            {
              name: 'content',
              valueReference: { reference: '#PrePopQuery' }
            }
          ]
        }
      ],
      questionnaire
    );

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('context');
    expect(result[0].part[0].name).toBe('name');
    expect(result[0].part[0].valueString).toBe('PrePopQuery');
    expect(result[0].part[1].name).toBe('content');
    expect(result[0].part[1].resource.resourceType).toBe('Bundle');
    expect(result[0].part[1].resource.id).toBe('PrePopQuery');
  });

  it('returns empty array if no matching contained Bundle', () => {
    const result = getContainedBatchContexts(
      [
        {
          name: 'context',
          part: [
            { name: 'name', valueString: 'DoesNotExist' },
            {
              name: 'content',
              valueReference: { reference: '#DoesNotExist' }
            }
          ]
        }
      ],
      questionnaire
    );
    expect(result).toEqual([]);
  });
});

describe('getFhirPathEmbeddings', () => {
  it('extracts all fhirpath embeddings from referenceContexts and containedBatchContexts', () => {
    const result = getFhirPathEmbeddings(referenceContexts, containedBatchContexts);

    expect(result).toEqual({
      'patient.id': ''
    });
  });
});

describe('evaluateFhirPathEmbeddings', () => {
  it('evaluates each fhirpath embedding using the corresponding launch context', async () => {
    const fhirPathEmbeddingsMap = {
      'patient.id': ''
    };

    const mockLaunchContexts: ResourceContext[] = [
      {
        name: 'context',
        part: [
          { name: 'name', valueString: 'patient' },
          { name: 'content', resource: mockPatient }
        ]
      },
      {
        name: 'context',
        part: [
          { name: 'name', valueString: 'user' },
          {
            name: 'content',
            resource: mockUser
          }
        ]
      },
      {
        name: 'context',
        part: [
          { name: 'name', valueString: 'encounter' },
          {
            name: 'content',
            resource: mockEncounter
          }
        ]
      }
    ];

    const result = await evaluateFhirPathEmbeddings(fhirPathEmbeddingsMap, mockLaunchContexts);

    expect(result).toEqual({
      'patient.id': 'patient-123'
    });
  });
});

describe('replaceEvaluatedFhirPathEmbeddingsInContexts', () => {
  it('replaces all {{%...}} expressions with evaluated values in both reference and contained contexts', () => {
    const evaluatedFhirPathEmbeddingsMap = {
      'patient.id': 'patient-123'
    };

    const result = replaceEvaluatedFhirPathEmbeddingsInContexts(
      evaluatedFhirPathEmbeddingsMap,
      referenceContexts,
      containedBatchContexts
    );

    // Check reference contexts
    expect(result.updatedReferenceContexts).toEqual([
      {
        name: 'context',
        part: [
          { name: 'name', valueString: 'ObsBodyHeight' },
          {
            name: 'content',
            valueReference: {
              reference: 'Observation?code=8302-2&_count=1&_sort=-date&patient=patient-123'
            }
          }
        ]
      },
      {
        name: 'context',
        part: [
          { name: 'name', valueString: 'ObsBodyWeight' },
          {
            name: 'content',
            valueReference: {
              reference: 'Observation?code=29463-7&_count=1&_sort=-date&patient=patient-123'
            }
          }
        ]
      }
    ]);

    // Check contained contexts
    const containedBundle = result.updatedContainedBatchContexts[0].part[1].resource as Bundle;
    expect(containedBundle.resourceType).toBe('Bundle');
    expect(containedBundle.entry.map((entry) => entry.request.url)).toEqual([
      'AllergyIntolerance?patient=patient-123',
      'Condition?patient=patient-123'
    ]);
  });
});

describe('readFhirPathEmbeddingsFromStr', () => {
  it('extracts multiple embedded fhirpath expressions from a string', () => {
    const input = 'Observation?code=8302-2&_count=1&_sort=-date&patient={{%patient.id}}';
    const result = readFhirPathEmbeddingsFromStr(input);
    expect(result).toEqual(['patient.id']);
  });

  it('returns empty array if no embeddings are present', () => {
    const input = 'Observation?code=8302-2&_count=1';
    const result = readFhirPathEmbeddingsFromStr(input);
    expect(result).toEqual([]);
  });
});

describe('handleFhirPathResult', () => {
  it('returns non-promise input as-is', async () => {
    const result = await handleFhirPathResult(['a', 'b']);
    expect(result).toEqual(['a', 'b']);
  });

  it('awaits and returns resolved result from a promise', async () => {
    const result = await handleFhirPathResult(Promise.resolve(['x', 'y']));
    expect(result).toEqual(['x', 'y']);
  });
});
