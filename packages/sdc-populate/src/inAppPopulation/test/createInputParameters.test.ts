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

import { createPopulateInputParameters } from '../utils/createInputParameters';
import { resolveFhirContextReferences } from '../utils/resolveFhirContexts';
import type { Encounter, Endpoint, Patient, Practitioner, Questionnaire } from 'fhir/r4';
import type {
  LaunchContext,
  QuestionnaireLevelXFhirQueryVariable,
  SourceQuery
} from '../interfaces/inAppPopulation.interface';

// Mock resolveFhirContextReferences function
jest.mock('../utils/resolveFhirContexts');

const mockFetchResourceCallback = jest.fn();
const mockFetchResourceCallbackConfig = {
  sourceServerUrl: 'https://example.com/fhir'
};

describe('createPopulateInputParameters', () => {
  const mockQuestionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    id: 'q1',
    status: 'draft',
    url: 'http://example.com/assessments/test/1',
    subjectType: ['Patient'],
    contained: [
      {
        resourceType: 'Bundle',
        id: 'PrePopQuery',
        type: 'batch',
        entry: [
          {
            fullUrl: 'urn:uuid:38a25157-b8e4-42e4-9525-7954fed52573',
            request: { method: 'GET', url: 'AllergyIntolerance?patient={{%patient.id}}' }
          },
          {
            fullUrl: 'urn:uuid:38a25157-b8e4-42e4-9525-7954fed52575',
            request: { method: 'GET', url: 'Condition?patient={{%patient.id}}' }
          }
        ]
      }
    ]
  };

  const mockPatient: Patient = {
    resourceType: 'Patient',
    id: 'patient-123',
    name: [{ text: 'John Doe' }]
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

  const mockFhirContext = [{ type: 'Endpoint', reference: 'Endpoint/123' }];

  const mockLaunchContexts: LaunchContext[] = [
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'patient'
          }
        },
        {
          url: 'type',
          valueCode: 'Patient'
        },
        {
          url: 'description',
          valueString: 'The patient that is to be used to pre-populate the form'
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'user'
          }
        },
        {
          url: 'type',
          valueCode: 'Practitioner'
        },
        {
          url: 'description',
          valueString: 'The practitioner user that is to be used to pre-populate the form'
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'encounter'
          }
        },
        {
          url: 'type',
          valueCode: 'Encounter'
        },
        {
          url: 'description',
          valueString: 'The encounter that is to be used to pre-populate the form'
        }
      ]
    },
    // fhirContext reference for the Endpoint
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'endpoint'
          }
        },
        {
          url: 'type',
          valueCode: 'Endpoint'
        },
        {
          url: 'description',
          valueString:
            'A AusCVDRisk-i launch endpoint to pre-populate a cqf-expression in the Absolute cardiovascular disease risk calculation section'
        }
      ]
    }
  ];

  const mockSourceQueries: SourceQuery[] = [
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-sourceQueries',
      valueReference: {
        reference: '#PrePopQuery'
      }
    }
  ];

  const mockQuestionnaireLevelVariables: QuestionnaireLevelXFhirQueryVariable[] = [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsBodyHeight',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=8302-2&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsBodyWeight',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=29463-7&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    }
  ];

  const mockFhirPathContext = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns correctly formed Parameters resource', async () => {
    const endpoint: Endpoint = {
      resourceType: 'Endpoint',
      id: '123',
      status: 'active',
      address: 'https://example.com/launch',
      connectionType: {
        system: 'http://terminology.hl7.org/CodeSystem/endpoint-connection-type',
        code: 'hl7-fhir-rest'
      },
      payloadType: [],
      payloadMimeType: ['text/html']
    };

    // Setup resolveFhirContextReferences mock to return resolved resource
    (resolveFhirContextReferences as jest.Mock).mockResolvedValue({
      Endpoint: endpoint
    });

    const result = await createPopulateInputParameters(
      mockQuestionnaire,
      mockPatient,
      mockUser,
      mockEncounter,
      mockFhirContext,
      mockLaunchContexts,
      mockSourceQueries,
      mockQuestionnaireLevelVariables,
      mockFhirPathContext,
      mockFetchResourceCallback,
      mockFetchResourceCallbackConfig,
      5000
    );

    expect(resolveFhirContextReferences).toHaveBeenCalledWith(
      mockFhirContext,
      mockFetchResourceCallback,
      mockFetchResourceCallbackConfig,
      5000
    );

    expect(result).toBeDefined();
    expect(result?.resourceType).toBe('Parameters');
    expect(result?.parameter).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'questionnaire',
          resource: mockQuestionnaire
        }),
        expect.objectContaining({
          name: 'subject',
          valueReference: expect.objectContaining({
            type: 'Patient',
            reference: 'Patient/patient-123',
            display: 'John Doe'
          })
        }),
        expect.objectContaining({
          name: 'canonical',
          valueString: mockQuestionnaire.url
        }),
        // Contexts - launch contexts, source queries, questionnaire-level variables
        expect.objectContaining({ name: 'context' }),
        expect.objectContaining({ name: 'local', valueBoolean: false })
      ])
    );

    // The fhirPathContext should be updated with 'patient' and 'user' keys referencing resources
    expect(mockFhirPathContext['patient']).toEqual(mockPatient);
    expect(mockFhirPathContext['user']).toEqual(mockUser);
    expect(mockFhirPathContext['encounter']).toEqual(mockEncounter);
    expect(mockFhirPathContext['endpoint']).toEqual(endpoint);
  });

  it('returns null if patientSubject cannot be created due to subjectType mismatch', async () => {
    const questionnaireWithoutPatient = {
      ...mockQuestionnaire,
      subjectType: ['Group'] // No 'Patient'
    };

    const result = await createPopulateInputParameters(
      questionnaireWithoutPatient,
      mockPatient,
      mockUser,
      mockEncounter,
      null,
      [],
      [],
      [],
      {},
      mockFetchResourceCallback,
      mockFetchResourceCallbackConfig,
      5000
    );

    expect(result).toBeNull();
  });

  it('includes no contexts if launchContexts, sourceQueries and variables are empty', async () => {
    (resolveFhirContextReferences as jest.Mock).mockResolvedValue({});

    const fhirPathContext: Record<string, any> = {};

    const result = await createPopulateInputParameters(
      mockQuestionnaire,
      mockPatient,
      null,
      null,
      null,
      [],
      [],
      [],
      fhirPathContext,
      mockFetchResourceCallback,
      mockFetchResourceCallbackConfig,
      5000
    );

    expect(result?.parameter).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'questionnaire' }),
        expect.objectContaining({ name: 'subject' }),
        expect.objectContaining({ name: 'canonical' }),
        expect.objectContaining({ name: 'local', valueBoolean: false })
      ])
    );

    expect(result?.parameter).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'context' })])
    );

    expect(fhirPathContext).toEqual({});
  });
});
