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

import { extractResultIsOperationOutcome, inAppExtract } from '../utils';
import type { OperationOutcome, Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import type { ExtractResult } from '../interfaces';
import { extract } from '../../SDCExtractQuestionnaireResponseOperation';
import { encode } from 'js-base64';

// Mock the extract function from SDCExtractQuestionnaireResponseOperation
jest.mock('../../SDCExtractQuestionnaireResponseOperation');

describe('inAppExtract', () => {
  const questionnaireResponse: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    id: 'qr1',
    status: 'in-progress'
  };
  const questionnaire: Questionnaire = { resourceType: 'Questionnaire', id: 'q1', status: 'draft' };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns failure if extract() returns OperationOutcome', async () => {
    const opOutcome = { resourceType: 'OperationOutcome', issue: [] };
    (extract as jest.Mock).mockResolvedValueOnce(opOutcome);

    const result = await inAppExtract(questionnaireResponse, questionnaire, null);

    expect(result.extractSuccess).toBe(false);
    expect(result.extractResult).toEqual(opOutcome);
  });

  it('returns success with extractedBundle and no issues or debugInfo', async () => {
    const bundle = { resourceType: 'Bundle', id: 'b1' };
    const outputParams = {
      resourceType: 'Parameters',
      parameter: [{ name: 'return', resource: bundle }]
    };
    (extract as jest.Mock).mockResolvedValueOnce(outputParams);

    const output = await inAppExtract(questionnaireResponse, questionnaire, null);

    expect(output.extractSuccess).toBe(true);
    const extractResult = output.extractResult as ExtractResult;
    expect(extractResultIsOperationOutcome(extractResult)).toBe(false);

    expect(extractResult.extractedBundle).toEqual(bundle);
    expect(extractResult.issues).toBeNull();
    expect(extractResult.debugInfo).toBeNull();
  });

  it('includes issues if issues parameter present', async () => {
    const bundle = { resourceType: 'Bundle', id: 'b1' };
    const issues = { resourceType: 'OperationOutcome', issue: [{ severity: 'warning' }] };
    const mockOutputParams = {
      resourceType: 'Parameters',
      parameter: [
        { name: 'return', resource: bundle },
        { name: 'issues', resource: issues }
      ]
    };
    (extract as jest.Mock).mockResolvedValueOnce(mockOutputParams);

    const output = await inAppExtract(questionnaireResponse, questionnaire, null);

    expect(output.extractSuccess).toBe(true);
    const extractResult = output.extractResult as ExtractResult;
    expect(extractResultIsOperationOutcome(extractResult)).toBe(false);

    expect(extractResult.extractedBundle).toEqual(bundle);
    expect(extractResult.issues).toEqual(issues);
  });

  it('parses debugInfo if present and valid', async () => {
    const bundle = { resourceType: 'Bundle', id: 'b1' };
    const debugObject = { templateIdToExtractPathTuples: {} };
    const debugBase64 = encode(JSON.stringify(debugObject));
    const outputParams = {
      resourceType: 'Parameters',
      parameter: [
        { name: 'return', resource: bundle },
        {
          name: 'debugInfo-custom',
          valueAttachment: { data: debugBase64 }
        }
      ]
    };
    (extract as jest.Mock).mockResolvedValueOnce(outputParams);

    const output = await inAppExtract(questionnaireResponse, questionnaire, null);

    expect(output.extractSuccess).toBe(true);
    const extractResult = output.extractResult as ExtractResult;
    expect(extractResultIsOperationOutcome(extractResult)).toBe(false);

    expect(extractResult.debugInfo).toEqual(debugObject);
  });

  it('uses fetchQuestionnaireCallback if questionnaireOrCallback is callback object', async () => {
    const bundle = { resourceType: 'Bundle', id: 'b1' };
    const callbackObj = {
      fetchQuestionnaireCallback: jest.fn().mockResolvedValue(bundle),
      fetchQuestionnaireRequestConfig: { sourceServerUrl: 'http://example.com' }
    };

    const outputParams = {
      resourceType: 'Parameters',
      parameter: [{ name: 'return', resource: bundle }]
    };
    (extract as jest.Mock).mockResolvedValueOnce(outputParams);

    const output = await inAppExtract(questionnaireResponse, callbackObj, null);

    expect(output.extractSuccess).toBe(true);
    const extractResult = output.extractResult as ExtractResult;
    expect(extractResult.extractedBundle).toEqual(bundle);
    expect(callbackObj.fetchQuestionnaireCallback).not.toHaveBeenCalled(); // Because inAppExtract passes it to extract(), does not call directly
  });

  it('returns failure if return parameter resource is not Bundle', async () => {
    const outputParams = {
      resourceType: 'Parameters',
      parameter: [{ name: 'return', resource: { resourceType: 'Patient' } }]
    };
    (extract as jest.Mock).mockResolvedValueOnce(outputParams);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const output = await inAppExtract(questionnaireResponse, questionnaire, null);

    expect(output.extractSuccess).toBe(false);
    const extractResult = output.extractResult as OperationOutcome;
    expect(extractResultIsOperationOutcome(extractResult)).toBe(true);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
