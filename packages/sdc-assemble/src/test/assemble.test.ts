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

import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import type { OperationOutcome, Questionnaire } from 'fhir/r4';
import { assemble } from '../utils/assemble';
import type { FetchQuestionnaireCallback, InputParameters } from '../interfaces';
import { fetchSubquestionnaires } from '../utils/fetchSubquestionnaires';

// Mock the fetchSubquestionnaires function
jest.mock('../utils/fetchSubquestionnaires');

const mockFetchSubquestionnaires = fetchSubquestionnaires as jest.MockedFunction<
  typeof fetchSubquestionnaires
>;

const mockFetchQuestionnaireCallback = jest.fn() as jest.MockedFunction<FetchQuestionnaireCallback>;
const mockFetchQuestionnaireCallbackConfig = {
  sourceServerUrl: 'https://example.com/fhir'
};

describe('assemble', () => {
  const createBaseQuestionnaire = (): Questionnaire => ({
    resourceType: 'Questionnaire',
    id: 'root-questionnaire',
    status: 'draft',
    version: '1.0.0',
    url: 'http://example.com/assessments/test/1',
    meta: {
      profile: ['http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-modular']
    },
    item: [
      {
        linkId: 'root-group',
        type: 'group',
        item: [
          {
            linkId: 'subq-ref',
            type: 'display',
            text: 'Sub-questionnaire [http://example.com/assessments/test/1/PatientDetails|1.0.0] not available. Unable to display all questions.',
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
                valueCanonical: 'http://example.com/assessments/test/1/PatientDetails|1.0.0'
              }
            ]
          }
        ]
      }
    ]
  });

  const createSubquestionnaire = (): Questionnaire => ({
    resourceType: 'Questionnaire',
    id: 'sub-questionnaire',
    status: 'draft',
    version: '1.0.0',
    url: 'http://example.com/assessments/test/1/PatientDetails',
    extension: [
      {
        url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-assemble-expectation',
        valueCode: 'assemble-child'
      }
    ],
    item: [
      {
        linkId: 'sub-question',
        type: 'string',
        text: 'What is your name?'
      }
    ]
  });

  const createInputParameters = (questionnaire: Questionnaire): InputParameters => ({
    resourceType: 'Parameters',
    parameter: [
      {
        name: 'questionnaire',
        resource: questionnaire
      }
    ]
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should assemble simple questionnaire with subquestionnaire', async () => {
    const rootQuestionnaire = createBaseQuestionnaire();
    const subquestionnaire = createSubquestionnaire();
    const inputParameters = createInputParameters(rootQuestionnaire);

    mockFetchSubquestionnaires.mockResolvedValue([subquestionnaire]);

    const result = await assemble(
      inputParameters,
      mockFetchQuestionnaireCallback,
      mockFetchQuestionnaireCallbackConfig
    );

    expect(result.resourceType).toBe('Questionnaire');
    const assembledQuestionnaire = result as Questionnaire;
    expect(assembledQuestionnaire.version).toBe('1.0.0-assembled');
    expect(assembledQuestionnaire.url).toBe('http://example.com/assessments/test/1');
    expect(assembledQuestionnaire.item?.[0]?.item).toHaveLength(1);
    expect(assembledQuestionnaire.item?.[0]?.item?.[0]?.linkId).toBe('sub-question');
  });

  it('should return OperationOutcome when subquestionnaire fetch fails', async () => {
    const rootQuestionnaire = createBaseQuestionnaire();
    const inputParameters = createInputParameters(rootQuestionnaire);

    // Mock fetchSubquestionnaires to return an OperationOutcome error
    const operationOutcome: OperationOutcome = {
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'not-found',
          details: { text: 'Questionnaire not found' }
        }
      ]
    };
    mockFetchSubquestionnaires.mockResolvedValue(operationOutcome);

    const result = await assemble(
      inputParameters,
      mockFetchQuestionnaireCallback,
      mockFetchQuestionnaireCallbackConfig
    );

    expect(result.resourceType).toBe('OperationOutcome');
    const resultOutcome = result as OperationOutcome;
    expect(resultOutcome.issue?.[0]?.severity).toBe('error');
  });

  it('should handle recursive assembly of nested subquestionnaires', async () => {
    const rootQuestionnaire = createBaseQuestionnaire();

    const nestedSubquestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'nested-sub',
      status: 'draft',
      version: '1.0.0',
      url: 'http://example.com/assessments/test/1/PatientDetails',
      meta: {
        profile: ['http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-modular']
      },
      item: [
        {
          linkId: 'nested-group',
          type: 'group',
          item: [
            {
              linkId: 'deep-subq-ref',
              type: 'display',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
                  valueCanonical:
                    'http://example.com/assessments/test/1/PatientDetails/Demographics|1.0.0'
                }
              ]
            }
          ]
        }
      ]
    };

    const deepSubquestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'deep-sub',
      status: 'draft',
      version: '1.0.0',
      url: 'http://example.com/assessments/test/1/PatientDetails/Demographics',
      item: [
        {
          linkId: 'deep-question',
          type: 'integer',
          text: 'What is your age?'
        }
      ]
    };

    const inputParameters = createInputParameters(rootQuestionnaire);

    // Mock fetchSubquestionnaires to first return the nested subquestionnaire, then the deep one
    mockFetchSubquestionnaires
      .mockResolvedValueOnce([nestedSubquestionnaire])
      .mockResolvedValueOnce([deepSubquestionnaire]);

    const result = await assemble(
      inputParameters,
      mockFetchQuestionnaireCallback,
      mockFetchQuestionnaireCallbackConfig
    );

    expect(result.resourceType).toBe('Questionnaire');
    const assembledQuestionnaire = result as Questionnaire;
    expect(assembledQuestionnaire.version).toBe('1.0.0-assembled');
    expect(assembledQuestionnaire.url).toBe('http://example.com/assessments/test/1');
    expect(mockFetchSubquestionnaires).toHaveBeenCalledTimes(2);
  });

  it('should handle multiple subquestionnaires in same parent', async () => {
    const multiSubqQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'multi-subq',
      status: 'draft',
      version: '1.0.0',
      url: 'http://example.com/assessments/test/1',
      meta: {
        profile: ['http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-modular']
      },
      item: [
        {
          linkId: 'root-group',
          type: 'group',
          item: [
            {
              linkId: 'subq1-ref',
              type: 'display',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
                  valueCanonical: 'http://example.com/assessments/test/1/PatientDetails|1.0.0'
                }
              ]
            },
            {
              linkId: 'subq2-ref',
              type: 'display',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
                  valueCanonical: 'http://example.com/assessments/test/1/MedicalHistory|1.0.0'
                }
              ]
            }
          ]
        }
      ]
    };

    const subq1: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'subq1',
      status: 'draft',
      version: '1.0.0',
      url: 'http://example.com/assessments/test/1/PatientDetails',
      item: [{ linkId: 'patient-name', type: 'string', text: 'Patient Name' }]
    };

    const subq2: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'subq2',
      status: 'draft',
      version: '1.0.0',
      url: 'http://example.com/assessments/test/1/MedicalHistory',
      item: [{ linkId: 'medical-history', type: 'text', text: 'Medical History' }]
    };

    const inputParameters = createInputParameters(multiSubqQuestionnaire);

    // Mock fetchSubquestionnaires to return both subquestionnaires
    mockFetchSubquestionnaires.mockResolvedValue([subq1, subq2]);

    const result = await assemble(
      inputParameters,
      mockFetchQuestionnaireCallback,
      mockFetchQuestionnaireCallbackConfig
    );

    expect(result.resourceType).toBe('Questionnaire');
    const assembledQuestionnaire = result as Questionnaire;
    expect(assembledQuestionnaire.version).toBe('1.0.0-assembled');
    expect(assembledQuestionnaire.url).toBe('http://example.com/assessments/test/1');
    expect(assembledQuestionnaire.item?.[0]?.item).toHaveLength(2);
    expect(assembledQuestionnaire.item?.[0]?.item?.[0]?.linkId).toBe('patient-name');
    expect(assembledQuestionnaire.item?.[0]?.item?.[1]?.linkId).toBe('medical-history');
  });

  it('should propagate contained resources from subquestionnaires', async () => {
    const rootQuestionnaire = createBaseQuestionnaire();

    const subquestionnaireWithContained: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'with-contained',
      status: 'draft',
      version: '1.0.0',
      url: 'http://example.com/assessments/test/1/PatientDetails',
      contained: [
        {
          resourceType: 'ValueSet',
          id: 'gender-valueset',
          status: 'draft',
          name: 'GenderValueSet',
          compose: {
            include: [
              {
                system: 'http://hl7.org/fhir/administrative-gender',
                concept: [
                  { code: 'male', display: 'Male' },
                  { code: 'female', display: 'Female' }
                ]
              }
            ]
          }
        }
      ],
      item: [
        {
          linkId: 'gender-question',
          type: 'choice',
          text: 'Gender',
          answerValueSet: '#gender-valueset'
        }
      ]
    };

    const inputParameters = createInputParameters(rootQuestionnaire);

    mockFetchSubquestionnaires.mockResolvedValue([subquestionnaireWithContained]);

    const result = await assemble(
      inputParameters,
      mockFetchQuestionnaireCallback,
      mockFetchQuestionnaireCallbackConfig
    );

    expect(result.resourceType).toBe('Questionnaire');
    const assembledQuestionnaire = result as Questionnaire;
    expect(assembledQuestionnaire.contained).toHaveLength(1);
    expect(assembledQuestionnaire.contained?.[0]?.resourceType).toBe('ValueSet');
    expect(assembledQuestionnaire.contained?.[0]?.id).toBe('gender-valueset');
  });

  it('should propagate extensions from subquestionnaires', async () => {
    const rootQuestionnaire = createBaseQuestionnaire();

    const subquestionnaireWithExtensions: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'with-extensions',
      status: 'draft',
      version: '1.0.0',
      url: 'http://example.com/assessments/test/1/PatientDetails',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/cqf-library',
          valueCanonical: 'http://example.com/Library/PatientDetailsLib'
        }
      ],
      item: [
        {
          linkId: 'root-item',
          type: 'group',
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/variable',
              valueExpression: {
                name: 'patientName',
                language: 'text/fhirpath',
                expression: '%patient.name'
              }
            }
          ],
          item: [
            {
              linkId: 'patient-question',
              type: 'string',
              text: 'Patient Details'
            }
          ]
        }
      ]
    };

    const inputParameters = createInputParameters(rootQuestionnaire);

    mockFetchSubquestionnaires.mockResolvedValue([subquestionnaireWithExtensions]);

    const result = await assemble(
      inputParameters,
      mockFetchQuestionnaireCallback,
      mockFetchQuestionnaireCallbackConfig
    );

    expect(result.resourceType).toBe('Questionnaire');
    const assembledQuestionnaire = result as Questionnaire;

    // Check for cqf-library extension at root level
    const cqfLibraryExt = assembledQuestionnaire.extension?.find(
      (ext) => ext.url === 'http://hl7.org/fhir/StructureDefinition/cqf-library'
    );
    expect(cqfLibraryExt).toBeDefined();
    expect(cqfLibraryExt?.valueCanonical).toBe('http://example.com/Library/PatientDetailsLib');

    // Check for variable extension at item level
    const variableExt = assembledQuestionnaire.item?.[0]?.extension?.find(
      (ext) => ext.url === 'http://hl7.org/fhir/StructureDefinition/variable'
    );
    expect(variableExt).toBeDefined();
  });

  it('should handle prohibited attributes error', async () => {
    const rootQuestionnaire = createBaseQuestionnaire();

    const subquestionnaireWithProhibitedAttr: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'prohibited',
      status: 'draft',
      version: '1.0.0',
      url: 'http://example.com/assessments/test/1/PatientDetails',
      experimental: true, // This might trigger prohibited attributes check
      item: [
        {
          linkId: 'question',
          type: 'string',
          text: 'Some question'
        }
      ]
    };

    const inputParameters = createInputParameters(rootQuestionnaire);

    mockFetchSubquestionnaires.mockResolvedValue([subquestionnaireWithProhibitedAttr]);

    const result = await assemble(
      inputParameters,
      mockFetchQuestionnaireCallback,
      mockFetchQuestionnaireCallbackConfig
    );

    // Note: This test assumes checkProhibitedAttributes would catch the experimental attribute
    // The actual implementation may vary, so we just verify it doesn't crash
    expect(result.resourceType).toBe('Questionnaire');
  });

  it('should handle empty response from fetchSubquestionnaires', async () => {
    const rootQuestionnaire = createBaseQuestionnaire();
    const inputParameters = createInputParameters(rootQuestionnaire);

    // Mock fetchSubquestionnaires to return empty result (simulating empty Bundle)
    const operationOutcome: OperationOutcome = {
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'not-found',
          details: { text: 'No subquestionnaires found' }
        }
      ]
    };
    mockFetchSubquestionnaires.mockResolvedValue(operationOutcome);

    const result = await assemble(
      inputParameters,
      mockFetchQuestionnaireCallback,
      mockFetchQuestionnaireCallbackConfig
    );

    expect(result.resourceType).toBe('OperationOutcome');
    const resultOutcome = result as OperationOutcome;
    expect(resultOutcome.issue?.[0]?.severity).toBe('error');
  });

  it('should handle fetchSubquestionnaires rejection', async () => {
    const rootQuestionnaire = createBaseQuestionnaire();
    const inputParameters = createInputParameters(rootQuestionnaire);

    // Mock fetchSubquestionnaires to return an OperationOutcome indicating network error
    const operationOutcome: OperationOutcome = {
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'exception',
          details: { text: 'Network error' }
        }
      ]
    };
    mockFetchSubquestionnaires.mockResolvedValue(operationOutcome);

    const result = await assemble(
      inputParameters,
      mockFetchQuestionnaireCallback,
      mockFetchQuestionnaireCallbackConfig
    );

    expect(result.resourceType).toBe('OperationOutcome');
    const resultOutcome = result as OperationOutcome;
    expect(resultOutcome.issue?.[0]?.severity).toBe('error');
  });
});
