/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

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

import { renderHook } from '@testing-library/react';
import type { QuestionnaireItem, OperationOutcome } from 'fhir/r4';
import useValidationFeedbackSeverity from '../hooks/useValidationFeedbackSeverity';
import type { TargetConstraint } from '../interfaces/targetConstraint.interface';

// Mock dependencies
jest.mock('../utils/extensions', () => ({
  getMaxQuantityValue: jest.fn(),
  getMaxQuantityValueFeedback: jest.fn(),
  getMaxValue: jest.fn(),
  getMaxValueFeedback: jest.fn(),
  getMinQuantityValue: jest.fn(),
  getMinQuantityValueFeedback: jest.fn(),
  getMinValue: jest.fn(),
  getMinValueFeedback: jest.fn(),
  getRegexValidation: jest.fn(),
  getRequiredFeedback: jest.fn()
}));

jest.mock('fhir-sdc-helpers', () => ({
  structuredDataCapture: {
    getMinLength: jest.fn(),
    getMaxDecimalPlaces: jest.fn()
  }
}));

let mockInvalidItems: Record<string, OperationOutcome> = {};
let mockRequiredItemsIsHighlighted = false;
let mockTargetConstraints: Record<string, TargetConstraint> = {};
let mockTargetConstraintLinkIds: Record<string, string[]> = {};

jest.mock('../stores', () => ({
  useQuestionnaireResponseStore: {
    use: {
      invalidItems: () => mockInvalidItems,
      requiredItemsIsHighlighted: () => mockRequiredItemsIsHighlighted
    }
  },
  useQuestionnaireStore: {
    use: {
      targetConstraints: () => mockTargetConstraints,
      targetConstraintLinkIds: () => mockTargetConstraintLinkIds
    }
  }
}));

import { getRequiredFeedback, getRegexValidation } from '../utils/extensions';

const mockGetRequiredFeedback = getRequiredFeedback as jest.MockedFunction<
  typeof getRequiredFeedback
>;
const mockGetRegexValidation = getRegexValidation as jest.MockedFunction<typeof getRegexValidation>;

describe('useValidationFeedbackSeverity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInvalidItems = {};
    mockRequiredItemsIsHighlighted = false;
    mockTargetConstraints = {};
    mockTargetConstraintLinkIds = {};
    mockGetRequiredFeedback.mockReturnValue(null);
    mockGetRegexValidation.mockReturnValue(undefined);
  });

  describe('no validation issues', () => {
    it('returns empty feedback and error severity when there are no issues', () => {
      const qItem: QuestionnaireItem = { linkId: 'test', type: 'string' };

      const { result } = renderHook(() => useValidationFeedbackSeverity(qItem, undefined));

      expect(result.current.feedback).toBe('');
      expect(result.current.feedbackSeverity).toBe('error');
    });
  });

  describe('target constraint severity', () => {
    it('returns "error" severity when a target constraint with severityCode "error" is invalid', () => {
      const qItem: QuestionnaireItem = { linkId: 'test', type: 'string' };

      mockTargetConstraintLinkIds = { test: ['c1'] };
      mockTargetConstraints = {
        c1: {
          key: 'c1',
          severityCode: 'error',
          isInvalid: true,
          human: 'Value must not be empty',
          valueExpression: { language: 'text/fhirpath', expression: 'true' }
        }
      };

      const { result } = renderHook(() => useValidationFeedbackSeverity(qItem, undefined));

      expect(result.current.feedback).toBe('Value must not be empty');
      expect(result.current.feedbackSeverity).toBe('error');
    });

    it('returns "warning" severity when a target constraint with severityCode "warning" is invalid', () => {
      const qItem: QuestionnaireItem = { linkId: 'test', type: 'string' };

      mockTargetConstraintLinkIds = { test: ['c1'] };
      mockTargetConstraints = {
        c1: {
          key: 'c1',
          severityCode: 'warning',
          isInvalid: true,
          human: 'Consider adding a more specific value',
          valueExpression: { language: 'text/fhirpath', expression: 'true' }
        }
      };

      const { result } = renderHook(() => useValidationFeedbackSeverity(qItem, undefined));

      expect(result.current.feedback).toBe('Consider adding a more specific value');
      expect(result.current.feedbackSeverity).toBe('warning');
    });

    it('skips valid target constraints even if severity is warning', () => {
      const qItem: QuestionnaireItem = { linkId: 'test', type: 'string' };

      mockTargetConstraintLinkIds = { test: ['c1'] };
      mockTargetConstraints = {
        c1: {
          key: 'c1',
          severityCode: 'warning',
          isInvalid: false,
          human: 'Should not appear',
          valueExpression: { language: 'text/fhirpath', expression: 'true' }
        }
      };

      const { result } = renderHook(() => useValidationFeedbackSeverity(qItem, undefined));

      expect(result.current.feedback).toBe('');
    });
  });

  describe('feedbackFromParent severity', () => {
    it('always returns "error" severity for feedbackFromParent', () => {
      const qItem: QuestionnaireItem = { linkId: 'test', type: 'string' };

      const { result } = renderHook(() =>
        useValidationFeedbackSeverity(qItem, 'Parent group error')
      );

      expect(result.current.feedback).toBe('Parent group error');
      expect(result.current.feedbackSeverity).toBe('error');
    });
  });

  describe('OperationOutcome issue severity', () => {
    it('returns "error" severity when the matching issue has severity "error"', () => {
      const qItem: QuestionnaireItem = { linkId: 'test', type: 'string' };

      mockInvalidItems = {
        test: {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'invalid',
              details: { coding: [{ code: 'regex' }] }
            }
          ]
        }
      };

      mockGetRegexValidation.mockReturnValue(undefined);

      const { result } = renderHook(() => useValidationFeedbackSeverity(qItem, undefined));

      expect(result.current.feedback).toBe('Input should match the specified regex.');
      expect(result.current.feedbackSeverity).toBe('error');
    });

    it('returns "warning" severity when the matching issue has severity "warning"', () => {
      const qItem: QuestionnaireItem = { linkId: 'test', type: 'string' };

      mockInvalidItems = {
        test: {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'warning',
              code: 'invalid',
              details: { coding: [{ code: 'regex' }] }
            }
          ]
        }
      };

      mockGetRegexValidation.mockReturnValue(undefined);

      const { result } = renderHook(() => useValidationFeedbackSeverity(qItem, undefined));

      expect(result.current.feedback).toBe('Input should match the specified regex.');
      expect(result.current.feedbackSeverity).toBe('warning');
    });

    it('returns "warning" severity for a required field issue marked as warning', () => {
      const qItem: QuestionnaireItem = { linkId: 'test', type: 'string' };

      mockRequiredItemsIsHighlighted = true;
      mockInvalidItems = {
        test: {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'warning',
              code: 'required',
              details: { coding: [{ code: 'required' }] }
            }
          ]
        }
      };

      mockGetRequiredFeedback.mockReturnValue('Advisory: this field is recommended');

      const { result } = renderHook(() => useValidationFeedbackSeverity(qItem, undefined));

      expect(result.current.feedback).toBe('Advisory: this field is recommended');
      expect(result.current.feedbackSeverity).toBe('warning');
    });
  });

  describe('backward-compatible feedback text', () => {
    it('returns identical feedback text to the deprecated useValidationFeedback hook', async () => {
      const qItem: QuestionnaireItem = { linkId: 'test', type: 'string', maxLength: 5 };

      mockInvalidItems = {
        test: {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'business-rule',
              details: { coding: [{ code: 'maxLength' }] }
            }
          ]
        }
      };

      const { result } = renderHook(() => useValidationFeedbackSeverity(qItem, undefined));

      expect(result.current.feedback).toBe('Enter no more than 5 characters.');
      expect(result.current.feedbackSeverity).toBe('error');
    });
  });
});
