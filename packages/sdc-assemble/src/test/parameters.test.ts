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
import type { OperationOutcomeIssue, Questionnaire } from 'fhir/r4';
import { createOutputParameters } from '../utils/parameters';

describe('createOutputParameters', () => {
  it('should create output parameters with assembled questionnaire and issues', () => {
    const assembled: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'assembled-questionnaire',
      status: 'draft',
      url: 'http://example.com/assembled',
      title: 'Assembled Questionnaire'
    };

    const issues: OperationOutcomeIssue[] = [
      {
        severity: 'warning',
        code: 'invalid',
        details: { text: 'Warning message 1' }
      },
      {
        severity: 'information',
        code: 'informational',
        details: { text: 'Info message 1' }
      }
    ];

    const result = createOutputParameters(assembled, issues);

    expect(result).toEqual({
      resourceType: 'Parameters',
      parameter: [
        {
          name: 'return',
          resource: assembled
        },
        {
          name: 'outcome',
          resource: {
            resourceType: 'OperationOutcome',
            issue: issues
          }
        }
      ]
    });
  });

  it('should create output parameters with empty issues array', () => {
    const assembled: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'simple-questionnaire',
      status: 'active'
    };

    const issues: OperationOutcomeIssue[] = [];

    const result = createOutputParameters(assembled, issues);

    expect(result).toEqual({
      resourceType: 'Parameters',
      parameter: [
        {
          name: 'return',
          resource: assembled
        },
        {
          name: 'outcome',
          resource: {
            resourceType: 'OperationOutcome',
            issue: []
          }
        }
      ]
    });
  });

  it('should preserve all questionnaire properties in return parameter', () => {
    const complexQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'complex-q',
      meta: {
        versionId: '1',
        lastUpdated: '2023-01-01T00:00:00Z'
      },
      status: 'draft',
      url: 'http://example.com/complex',
      version: '1.0.0',
      name: 'ComplexQuestionnaire',
      title: 'Complex Questionnaire',
      description: 'A complex questionnaire for testing',
      publisher: 'Test Publisher',
      contact: [
        {
          name: 'Test Contact',
          telecom: [
            {
              system: 'email',
              value: 'test@example.com'
            }
          ]
        }
      ],
      item: [
        {
          linkId: 'item1',
          type: 'string',
          text: 'Sample question'
        }
      ]
    };

    const issues: OperationOutcomeIssue[] = [
      {
        severity: 'warning',
        code: 'code-invalid',
        details: { text: 'Some warning' }
      }
    ];

    const result = createOutputParameters(complexQuestionnaire, issues);

    expect(result.parameter[0].resource).toEqual(complexQuestionnaire);
    expect(result.parameter[1].resource.issue).toEqual(issues);
  });

  it('should handle single issue correctly', () => {
    const assembled: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'test-q',
      status: 'draft'
    };

    const issues: OperationOutcomeIssue[] = [
      {
        severity: 'error',
        code: 'invalid',
        details: { text: 'Single error message' }
      }
    ];

    const result = createOutputParameters(assembled, issues);

    expect(result.parameter[1].resource.issue).toHaveLength(1);
    expect(result.parameter[1].resource.issue[0]).toEqual(issues[0]);
  });

  it('should handle multiple issues of different severities', () => {
    const assembled: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'multi-issue-q',
      status: 'draft'
    };

    const issues: OperationOutcomeIssue[] = [
      {
        severity: 'error',
        code: 'invalid',
        details: { text: 'Error message' }
      },
      {
        severity: 'warning',
        code: 'code-invalid',
        details: { text: 'Warning message' }
      },
      {
        severity: 'information',
        code: 'informational',
        details: { text: 'Info message' }
      }
    ];

    const result = createOutputParameters(assembled, issues);

    expect(result.parameter[1].resource.issue).toHaveLength(3);
    expect(result.parameter[1].resource.issue).toEqual(issues);
  });

  it('should maintain correct parameter structure', () => {
    const assembled: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'structure-test',
      status: 'draft'
    };

    const issues: OperationOutcomeIssue[] = [];

    const result = createOutputParameters(assembled, issues);

    expect(result.resourceType).toBe('Parameters');
    expect(result.parameter).toHaveLength(2);
    expect(result.parameter[0].name).toBe('return');
    expect(result.parameter[1].name).toBe('outcome');
    expect(result.parameter[0].resource.resourceType).toBe('Questionnaire');
    expect(result.parameter[1].resource.resourceType).toBe('OperationOutcome');
  });
});
