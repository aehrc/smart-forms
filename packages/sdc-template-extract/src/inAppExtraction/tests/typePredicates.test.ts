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
  extractResultIsOperationOutcome,
  objIsTemplateExtractDebugInfo,
  questionnaireOrCallbackIsFetchQuestionnaireResolver,
  questionnaireOrCallbackIsQuestionnaire
} from '../utils/typePredicates';
import type { FetchQuestionnaireResolver } from '../interfaces';
import type { Questionnaire } from 'fhir/r4';

describe('questionnaireOrCallbackIsFetchQuestionnaireResolver', () => {
  test('questionnaireOrCallbackIsFetchQuestionnaireResolver should return true for valid object', () => {
    expect(
      questionnaireOrCallbackIsFetchQuestionnaireResolver({
        fetchQuestionnaireCallback: () => {},
        fetchQuestionnaireRequestConfig: {}
      } as unknown as FetchQuestionnaireResolver)
    ).toBe(true);
  });

  test('questionnaireOrCallbackIsQuestionnaire should return true for valid Questionnaire', () => {
    expect(
      questionnaireOrCallbackIsQuestionnaire({ resourceType: 'Questionnaire', status: 'draft' })
    ).toBe(true);
  });

  test('questionnaireOrCallbackIsQuestionnaire should return false for non-Questionnaire', () => {
    expect(
      questionnaireOrCallbackIsFetchQuestionnaireResolver({
        resourceType: 'Patient'
      } as unknown as Questionnaire)
    ).toBe(false);
  });
});

describe('extractResultIsOperationOutcome', () => {
  test('extractResultIsOperationOutcome should return true for OperationOutcome', () => {
    expect(extractResultIsOperationOutcome({ resourceType: 'OperationOutcome', issue: [] })).toBe(
      true
    );
  });

  test('extractResultIsOperationOutcome should return false for ExtractResult-like object', () => {
    expect(
      extractResultIsOperationOutcome({
        extractedBundle: {
          resourceType: 'Bundle',
          type: 'document'
        },
        issues: null,
        debugInfo: null
      })
    ).toBe(false);
  });
});

describe('objIsTemplateExtractDebugInfo', () => {
  test('objIsTemplateExtractDebugInfo should return true for valid TemplateExtractDebugInfo', () => {
    const input = { templateIdToExtractPathTuples: {} };
    expect(objIsTemplateExtractDebugInfo(input)).toBe(true);
  });

  test('objIsTemplateExtractDebugInfo should return false for plain object', () => {
    const input = { someOtherKey: 123 };
    expect(objIsTemplateExtractDebugInfo(input)).toBe(false);
  });
});
