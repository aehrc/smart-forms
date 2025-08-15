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
import {
  createSubquestionnaireNotFoundErrorOutcome,
  createErrorOutcome,
  createWarningIssue
} from '../utils/operationOutcome';

describe('createSubquestionnaireNotFoundErrorOutcome', () => {
  it('should create an OperationOutcome for subquestionnaire not found', () => {
    const canonical = 'http://example.com/questionnaire|1.0.0';
    const result = createSubquestionnaireNotFoundErrorOutcome(canonical);

    expect(result).toEqual({
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'not-found',
          details: {
            text: "Unable to fetch questionnaire with canonical url 'http://example.com/questionnaire|1.0.0'"
          }
        }
      ]
    });
  });

  it('should handle empty canonical string', () => {
    const result = createSubquestionnaireNotFoundErrorOutcome('');

    expect(result).toEqual({
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'not-found',
          details: {
            text: "Unable to fetch questionnaire with canonical url ''"
          }
        }
      ]
    });
  });
});

describe('createErrorOutcome', () => {
  it('should create an OperationOutcome with custom error message', () => {
    const errorMessage = 'Custom error message';
    const result = createErrorOutcome(errorMessage);

    expect(result).toEqual({
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'invalid',
          details: { text: errorMessage }
        }
      ]
    });
  });

  it('should handle empty error message', () => {
    const result = createErrorOutcome('');

    expect(result).toEqual({
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'invalid',
          details: { text: '' }
        }
      ]
    });
  });

  it('should handle special characters in error message', () => {
    const errorMessage = 'Error with "quotes" and special chars: <>&';
    const result = createErrorOutcome(errorMessage);

    expect(result).toEqual({
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'invalid',
          details: { text: errorMessage }
        }
      ]
    });
  });
});

describe('createWarningIssue', () => {
  it('should create an OperationOutcome issue with warning severity', () => {
    const warningMessage = 'This is a warning message';
    const result = createWarningIssue(warningMessage);

    expect(result).toEqual({
      severity: 'warning',
      code: 'invalid',
      details: { text: warningMessage }
    });
  });

  it('should handle empty warning message', () => {
    const result = createWarningIssue('');

    expect(result).toEqual({
      severity: 'warning',
      code: 'invalid',
      details: { text: '' }
    });
  });

  it('should handle long warning message', () => {
    const longMessage =
      'This is a very long warning message that contains multiple sentences. ' +
      'It should be handled properly by the function without any issues. ' +
      'The function should preserve the entire message content.';
    const result = createWarningIssue(longMessage);

    expect(result).toEqual({
      severity: 'warning',
      code: 'invalid',
      details: { text: longMessage }
    });
  });
});
