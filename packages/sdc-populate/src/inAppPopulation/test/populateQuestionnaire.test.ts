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

import type {
  Bundle,
  Encounter,
  OperationOutcome,
  Patient,
  Practitioner,
  Questionnaire,
  QuestionnaireResponse
} from 'fhir/r4';
import { Base64 } from 'js-base64';
import { patRepop } from '../../test-data-shared/patRepop';
import { pracPrimaryPeter } from '../../test-data-shared/pracPrimaryPeter';
import { encounterHealthCheck } from '../../test-data-shared/AboriginalTorresStraitIslanderHealthCheck/encounterHealthCheck';
import { QRCalculatedExpressionBMICalculatorPrepop } from '../../test-data-shared/CalculatedExpressionBMICalculatorPrepop/QRCalculatedExpressionBMICalculatorPrepop';
import { QCalculatedExpressionBMICalculatorPrepop } from '../../test-data-shared/CalculatedExpressionBMICalculatorPrepop/QCalculatedExpressionBMICalculatorPrepop';
import { populateQuestionnaire } from '../utils';
import { bundleObsBodyHeight } from '../../test-data-shared/CalculatedExpressionBMICalculatorPrepop/bundleObsBodyHeight';
import { bundleObsBodyWeight } from '../../test-data-shared/CalculatedExpressionBMICalculatorPrepop/bundleObsBodyWeight';
import type { OutputParameters } from '../../SDCPopulateQuestionnaireOperation';
import { populate } from '../../SDCPopulateQuestionnaireOperation';

// Mock populate function
jest.mock('../../SDCPopulateQuestionnaireOperation/utils/populate');

const mockFetchResourceCallback = jest.fn();
const mockFetchResourceCallbackConfig = {
  sourceServerUrl: 'https://example.com/fhir'
};

const mockTerminologyCallback = jest.fn();
const mockTerminologyCallbackConfig = {
  terminologyServerUrl: 'https://example.com/terminology/fhir'
};

// Launch context resources
const mockPatient: Patient = patRepop;
const mockPractitioner: Practitioner = pracPrimaryPeter;
const mockEncounter: Encounter = encounterHealthCheck;

// Pre-pop resources
const mockObsBodyHeight: Bundle = bundleObsBodyHeight;
const mockObsBodyWeight: Bundle = bundleObsBodyWeight;

// Questionnaire
const questionnaire: Questionnaire = QCalculatedExpressionBMICalculatorPrepop;

// Outputs
const mockResponse: QuestionnaireResponse = QRCalculatedExpressionBMICalculatorPrepop;
const mockContext = {
  resource: {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress'
  },
  rootResource: {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress'
  },
  patient: mockPatient,
  ObsBodyHeight: mockObsBodyHeight,
  ObsBodyWeight: mockObsBodyWeight,
  height: [],
  weight: []
};
const mockContextBase64 = Base64.encode(JSON.stringify(mockContext));

describe('populateQuestionnaire', () => {
  it('returns successfully population result with response and context', async () => {
    const mockOutputParameters: OutputParameters = {
      resourceType: 'Parameters',
      parameter: [
        {
          name: 'response',
          resource: mockResponse
        },
        {
          name: 'contextResult-custom',
          valueAttachment: {
            contentType: 'application/json',
            data: mockContextBase64
          }
        }
      ]
    };

    (populate as jest.Mock).mockImplementation(async () => mockOutputParameters);

    const result = await populateQuestionnaire({
      questionnaire: questionnaire,
      fetchResourceCallback: mockFetchResourceCallback,
      fetchResourceRequestConfig: mockFetchResourceCallbackConfig,
      patient: mockPatient,
      user: mockPractitioner,
      encounter: mockEncounter,
      fetchTerminologyCallback: mockTerminologyCallback,
      fetchTerminologyRequestConfig: mockTerminologyCallbackConfig,
      timeoutMs: 5000
    });

    expect(result.populateSuccess).toBe(true);
    expect(result.populateResult).not.toBeNull();
    expect(result.populateResult?.populatedResponse).toEqual(mockResponse);
    expect(result.populateResult?.populatedContext).toEqual(mockContext);
  });

  it('returns failed population result with response, issues and context', async () => {
    const mockOperationOutcome: OperationOutcome = {
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'processing',
          details: {
            text: 'An error occurred during population.'
          }
        }
      ]
    };

    (populate as jest.Mock).mockImplementation(async () => mockOperationOutcome);

    const result = await populateQuestionnaire({
      questionnaire: questionnaire,
      fetchResourceCallback: mockFetchResourceCallback,
      fetchResourceRequestConfig: mockFetchResourceCallbackConfig,
      patient: mockPatient,
      user: mockPractitioner,
      encounter: mockEncounter,
      fetchTerminologyCallback: mockTerminologyCallback,
      fetchTerminologyRequestConfig: mockTerminologyCallbackConfig,
      timeoutMs: 5000
    });

    expect(result.populateSuccess).toBe(false);
    expect(result.populateResult).toBeNull();
  });
});
