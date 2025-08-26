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
  assembleQuestionnaire,
  updateAssembledQuestionnaire,
  assembleIfRequired
} from '../utils/assemble';
import type { Questionnaire, OperationOutcome, Bundle, Parameters } from 'fhir/r4';
import * as FHIR from 'fhirclient';
import { isInputParameters } from '@aehrc/sdc-assemble';
import { getFormsServerAssembledBundlePromise } from '../features/dashboard/utils/dashboard';

// Mock dependencies
jest.mock('fhirclient');
jest.mock('@aehrc/sdc-assemble', () => ({
  isInputParameters: jest.fn()
}));
jest.mock('../features/dashboard/utils/dashboard');
jest.mock('../globals.ts', () => ({
  FORMS_SERVER_URL: 'http://test-forms-server.example.com/fhir'
}));

const mockFHIRClient = {
  request: jest.fn()
};

(FHIR.client as jest.Mock).mockReturnValue(mockFHIRClient);
const mockIsInputParameters = isInputParameters as unknown as jest.Mock;
const mockGetFormsServerAssembledBundlePromise = getFormsServerAssembledBundlePromise as jest.Mock;

describe('assemble comprehensive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('assembleQuestionnaire', () => {
    const mockQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'test-questionnaire',
      status: 'active',
      url: 'http://example.com/Questionnaire/test'
    };

    it('should assemble questionnaire successfully when parameters are valid', async () => {
      const expectedAssembledQuestionnaire: Questionnaire = {
        ...mockQuestionnaire,
        id: 'assembled-questionnaire'
      };

      const mockResponse = {
        parameter: [
          {
            resource: expectedAssembledQuestionnaire
          }
        ]
      };

      mockIsInputParameters.mockReturnValue(true);
      mockFHIRClient.request.mockResolvedValue(mockResponse);

      const result = await assembleQuestionnaire(mockQuestionnaire);

      expect(mockIsInputParameters).toHaveBeenCalledWith({
        resourceType: 'Parameters',
        parameter: [
          {
            name: 'questionnaire',
            resource: mockQuestionnaire
          }
        ]
      });

      expect(mockFHIRClient.request).toHaveBeenCalledWith({
        url: 'Questionnaire/$assemble',
        method: 'POST',
        body: JSON.stringify({
          resourceType: 'Parameters',
          parameter: [
            {
              name: 'questionnaire',
              resource: mockQuestionnaire
            }
          ]
        }),
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/fhir+json;charset=utf-8',
          Accept: 'application/json;charset=utf-8'
        }
      });

      expect(result).toEqual(expectedAssembledQuestionnaire);
    });

    it('should handle assemble failure and return non-questionnaire resource', async () => {
      const mockOperationOutcome: OperationOutcome = {
        resourceType: 'OperationOutcome',
        issue: [
          {
            severity: 'error',
            code: 'processing',
            diagnostics: 'Assembly failed'
          }
        ]
      };

      const mockResponse = {
        parameter: [
          {
            resource: mockOperationOutcome
          }
        ]
      };

      mockIsInputParameters.mockReturnValue(true);
      mockFHIRClient.request.mockResolvedValue(mockResponse);

      // Mock console.warn to verify it's called
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await assembleQuestionnaire(mockQuestionnaire);

      expect(consoleSpy).toHaveBeenCalledWith('Assemble fail');
      expect(consoleSpy).toHaveBeenCalledWith(mockOperationOutcome);
      expect(result).toEqual(mockOperationOutcome);

      consoleSpy.mockRestore();
    });

    it('should return original questionnaire when parameters are invalid', async () => {
      mockIsInputParameters.mockReturnValue(false);

      const result = await assembleQuestionnaire(mockQuestionnaire);

      expect(mockFHIRClient.request).not.toHaveBeenCalled();
      expect(result).toEqual(mockQuestionnaire);
    });

    it('should handle FHIR client request rejection', async () => {
      mockIsInputParameters.mockReturnValue(true);
      mockFHIRClient.request.mockRejectedValue(new Error('Network error'));

      await expect(assembleQuestionnaire(mockQuestionnaire)).rejects.toThrow('Network error');
    });

    it('should use correct parameters structure for assemble operation', async () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'complex-questionnaire',
        status: 'active',
        url: 'http://example.com/Questionnaire/complex',
        version: '1.0.0',
        title: 'Complex Test Questionnaire'
      };

      mockIsInputParameters.mockReturnValue(true);
      mockFHIRClient.request.mockResolvedValue({
        parameter: [{ resource: questionnaire }]
      });

      await assembleQuestionnaire(questionnaire);

      const expectedParameters: Parameters = {
        resourceType: 'Parameters',
        parameter: [
          {
            name: 'questionnaire',
            resource: questionnaire
          }
        ]
      };

      expect(mockIsInputParameters).toHaveBeenCalledWith(expectedParameters);
    });
  });

  describe('updateAssembledQuestionnaire', () => {
    const mockQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'test-questionnaire-to-update',
      status: 'active'
    };

    it('should update questionnaire with correct parameters', async () => {
      const mockResponse = { resourceType: 'Questionnaire', id: 'updated' };
      mockFHIRClient.request.mockResolvedValue(mockResponse);

      const result = await updateAssembledQuestionnaire(mockQuestionnaire);

      expect(mockFHIRClient.request).toHaveBeenCalledWith({
        url: `Questionnaire/${mockQuestionnaire.id}`,
        method: 'PUT',
        body: JSON.stringify(mockQuestionnaire),
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/fhir+json;charset=utf-8',
          Accept: 'application/json;charset=utf-8'
        }
      });

      expect(result).toEqual(mockResponse);
    });

    it('should handle update failure', async () => {
      mockFHIRClient.request.mockRejectedValue(new Error('Update failed'));

      await expect(updateAssembledQuestionnaire(mockQuestionnaire)).rejects.toThrow(
        'Update failed'
      );
    });

    it('should use questionnaire ID in URL correctly', async () => {
      const questionnaireWithSpecialId: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'questionnaire-with-special-characters-123',
        status: 'active'
      };

      mockFHIRClient.request.mockResolvedValue({});

      await updateAssembledQuestionnaire(questionnaireWithSpecialId);

      expect(mockFHIRClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'Questionnaire/questionnaire-with-special-characters-123',
          method: 'PUT'
        })
      );
    });
  });

  describe('assembleIfRequired', () => {
    const mockQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'test-questionnaire',
      status: 'active',
      url: 'http://example.com/Questionnaire/test',
      version: '1.0.0'
    };

    const mockQuestionnaireWithAssembleExtension: Questionnaire = {
      ...mockQuestionnaire,
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-assemble-expectation',
          valueCode: 'assemble-root'
        }
      ]
    };

    it('should return original questionnaire when assembly is not required', async () => {
      const result = await assembleIfRequired(mockQuestionnaire);

      expect(result).toEqual(mockQuestionnaire);
      expect(mockGetFormsServerAssembledBundlePromise).not.toHaveBeenCalled();
    });

    it('should return existing assembled questionnaire when available', async () => {
      const existingAssembledQuestionnaire: Questionnaire = {
        ...mockQuestionnaire,
        id: 'existing-assembled',
        version: '1.0.0-assembled'
      };

      const mockBundle: Bundle = {
        resourceType: 'Bundle',
        type: 'searchset',
        entry: [
          {
            resource: existingAssembledQuestionnaire
          }
        ]
      };

      mockGetFormsServerAssembledBundlePromise.mockResolvedValue(mockBundle);

      const result = await assembleIfRequired(mockQuestionnaireWithAssembleExtension);

      expect(mockGetFormsServerAssembledBundlePromise).toHaveBeenCalledWith(
        '/Questionnaire?_sort=-date&url=http://example.com/Questionnaire/test&version=1.0.0-assembled'
      );
      expect(result).toEqual(existingAssembledQuestionnaire);
    });

    it('should perform assembly when required but no existing assembled version exists', async () => {
      const assembledQuestionnaire: Questionnaire = {
        ...mockQuestionnaire,
        id: 'newly-assembled'
      };

      const emptyBundle: Bundle = {
        resourceType: 'Bundle',
        type: 'searchset',
        entry: []
      };

      mockGetFormsServerAssembledBundlePromise.mockResolvedValue(emptyBundle);
      mockIsInputParameters.mockReturnValue(true);
      mockFHIRClient.request
        .mockResolvedValueOnce({
          parameter: [{ resource: assembledQuestionnaire }]
        })
        .mockResolvedValueOnce({}); // for update operation

      const result = await assembleIfRequired(mockQuestionnaireWithAssembleExtension);

      expect(result).toEqual(assembledQuestionnaire);
      expect(mockFHIRClient.request).toHaveBeenCalledTimes(2); // assemble + update
    });

    it('should return null when assembly operation fails', async () => {
      const operationOutcome: OperationOutcome = {
        resourceType: 'OperationOutcome',
        issue: [
          {
            severity: 'error',
            code: 'processing'
          }
        ]
      };

      const emptyBundle: Bundle = {
        resourceType: 'Bundle',
        type: 'searchset',
        entry: []
      };

      mockGetFormsServerAssembledBundlePromise.mockResolvedValue(emptyBundle);
      mockIsInputParameters.mockReturnValue(true);
      mockFHIRClient.request.mockResolvedValue({
        parameter: [{ resource: operationOutcome }]
      });

      const result = await assembleIfRequired(mockQuestionnaireWithAssembleExtension);

      expect(result).toBeNull();
    });

    it('should handle bundle with no entries', async () => {
      const bundleWithoutEntries: Bundle = {
        resourceType: 'Bundle',
        type: 'searchset'
      };

      mockGetFormsServerAssembledBundlePromise.mockResolvedValue(bundleWithoutEntries);
      mockIsInputParameters.mockReturnValue(true);
      mockFHIRClient.request
        .mockResolvedValueOnce({
          parameter: [{ resource: mockQuestionnaire }]
        })
        .mockResolvedValueOnce({});

      const result = await assembleIfRequired(mockQuestionnaireWithAssembleExtension);

      expect(result).toEqual(mockQuestionnaire);
    });

    it('should handle bundle with entries but no resources', async () => {
      const bundleWithEmptyEntries: Bundle = {
        resourceType: 'Bundle',
        type: 'searchset',
        entry: [
          {} // entry without resource
        ]
      };

      mockGetFormsServerAssembledBundlePromise.mockResolvedValue(bundleWithEmptyEntries);
      mockIsInputParameters.mockReturnValue(true);
      mockFHIRClient.request
        .mockResolvedValueOnce({
          parameter: [{ resource: mockQuestionnaire }]
        })
        .mockResolvedValueOnce({});

      const result = await assembleIfRequired(mockQuestionnaireWithAssembleExtension);

      expect(result).toEqual(mockQuestionnaire);
    });

    it('should handle getFormsServerAssembledBundlePromise rejection', async () => {
      mockGetFormsServerAssembledBundlePromise.mockRejectedValue(new Error('Bundle fetch failed'));

      await expect(assembleIfRequired(mockQuestionnaireWithAssembleExtension)).rejects.toThrow(
        'Bundle fetch failed'
      );
    });

    it('should use correct query URL format for assembled questionnaire lookup', async () => {
      const questionnaireWithSpecialUrl: Questionnaire = {
        ...mockQuestionnaireWithAssembleExtension,
        url: 'http://example.com/fhir/Questionnaire/special-test',
        version: '2.1.0'
      };

      mockGetFormsServerAssembledBundlePromise.mockResolvedValue({
        resourceType: 'Bundle',
        type: 'searchset',
        entry: []
      });
      mockIsInputParameters.mockReturnValue(true);
      mockFHIRClient.request
        .mockResolvedValueOnce({
          parameter: [{ resource: questionnaireWithSpecialUrl }]
        })
        .mockResolvedValueOnce({});

      await assembleIfRequired(questionnaireWithSpecialUrl);

      expect(mockGetFormsServerAssembledBundlePromise).toHaveBeenCalledWith(
        '/Questionnaire?_sort=-date&url=http://example.com/fhir/Questionnaire/special-test&version=2.1.0-assembled'
      );
    });
  });
});
