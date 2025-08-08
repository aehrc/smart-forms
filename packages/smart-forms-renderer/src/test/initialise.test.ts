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

import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import type { Questionnaire, QuestionnaireResponse, QuestionnaireItemInitial } from 'fhir/r4';
import { initialiseQuestionnaireResponse, parseItemInitialToAnswer } from '../utils/initialise';

// Mock the dependencies
jest.mock('../utils/genericRecursive', () => ({
  readQuestionnaireResponse: jest.fn()
}));

jest.mock('../utils/enableWhenExpression', () => ({
  evaluateInitialEnableWhenExpressions: jest.fn()
}));

jest.mock('../utils/tabs', () => ({
  getFirstVisibleTab: jest.fn()
}));

jest.mock('../utils/page', () => ({
  getFirstVisiblePage: jest.fn()
}));

jest.mock('../utils/enableWhen', () => ({
  assignPopulatedAnswersToEnableWhen: jest.fn()
}));

jest.mock('../utils/calculatedExpression', () => ({
  evaluateInitialCalculatedExpressions: jest.fn()
}));

jest.mock('../utils/questionnaireResponseStoreUtils/updatableResponseItems', () => ({
  createQuestionnaireResponseItemMap: jest.fn()
}));

jest.mock('../utils/mapItem', () => ({
  getQrItemsIndex: jest.fn(),
  mapQItemsIndex: jest.fn()
}));

jest.mock('../utils/targetConstraint', () => ({
  evaluateInitialTargetConstraints: jest.fn()
}));

jest.mock('../utils/parameterisedValueSets', () => ({
  evaluateInitialDynamicValueSets: jest.fn()
}));

jest.mock('../utils/answerOptionsToggleExpressions', () => ({
  evaluateInitialAnswerOptionsToggleExpressions: jest.fn()
}));

jest.mock('../utils/choice', () => ({
  getRelevantCodingProperties: jest.fn((coding) => coding)
}));

import { readQuestionnaireResponse } from '../utils/genericRecursive';
const mockReadQuestionnaireResponse = readQuestionnaireResponse as jest.MockedFunction<typeof readQuestionnaireResponse>;

describe('initialiseQuestionnaireResponse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReadQuestionnaireResponse.mockReturnValue([]);
  });

  test('should create new QuestionnaireResponse when none provided', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active'
    };

    const result = initialiseQuestionnaireResponse(questionnaire);

    expect(result.resourceType).toBe('QuestionnaireResponse');
    expect(result.status).toBe('in-progress');
  });

  test('should use provided QuestionnaireResponse', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active'
    };

    const existingResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'completed',
      id: 'existing-response'
    };

    const result = initialiseQuestionnaireResponse(questionnaire, existingResponse);

    expect(result.id).toBe('existing-response');
    expect(result.status).toBe('completed');
  });

  test('should set status to in-progress when missing', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active'
    };

    const responseWithoutStatus: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse'
    } as QuestionnaireResponse;

    const result = initialiseQuestionnaireResponse(questionnaire, responseWithoutStatus);

    expect(result.status).toBe('in-progress');
  });

  test('should initialize items when questionnaire has items and response has none', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      item: [
        {
          linkId: 'item-1',
          type: 'string',
          text: 'Test Item'
        }
      ]
    };

    const mockInitialItems = [
      {
        linkId: 'item-1',
        text: 'Test Item',
        answer: [{ valueString: 'initial value' }]
      }
    ];

    mockReadQuestionnaireResponse.mockReturnValue(mockInitialItems);

    const result = initialiseQuestionnaireResponse(questionnaire);

    expect(mockReadQuestionnaireResponse).toHaveBeenCalled();
    expect(result.item).toEqual(mockInitialItems);
  });

  test('should not overwrite existing items in response', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      item: [
        {
          linkId: 'item-1',
          type: 'string',
          text: 'Test Item'
        }
      ]
    };

    const existingResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      item: [
        {
          linkId: 'item-1',
          text: 'Existing Item'
        }
      ]
    };

    const result = initialiseQuestionnaireResponse(questionnaire, existingResponse);

    expect(mockReadQuestionnaireResponse).not.toHaveBeenCalled();
    expect(result.item?.[0].text).toBe('Existing Item');
  });

  test('should create questionnaire reference when missing', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      url: 'http://example.com/questionnaire',
      version: '1.0'
    };

    const result = initialiseQuestionnaireResponse(questionnaire);

    expect(result.questionnaire).toBe('http://example.com/questionnaire|1.0');
  });

  test('should handle questionnaire with url but no version', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      url: 'http://example.com/questionnaire'
    };

    const result = initialiseQuestionnaireResponse(questionnaire);

    expect(result.questionnaire).toBe('http://example.com/questionnaire');
  });

  test('should handle questionnaire with id but no url', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      id: 'questionnaire-id'
    };

    const result = initialiseQuestionnaireResponse(questionnaire);

    expect(result.questionnaire).toBe('Questionnaire/questionnaire-id');
  });

  test('should handle questionnaire without url, version, or id', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active'
    };

    const result = initialiseQuestionnaireResponse(questionnaire);

    expect(result.questionnaire).toBe('');
  });

  test('should not overwrite existing questionnaire reference', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      url: 'http://example.com/questionnaire'
    };

    const existingResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      questionnaire: 'existing-reference'
    };

    const result = initialiseQuestionnaireResponse(questionnaire, existingResponse);

    expect(result.questionnaire).toBe('existing-reference');
  });
});

describe('parseItemInitialToAnswer', () => {
  test('should parse valueString initial value', () => {
    const initial: QuestionnaireItemInitial = {
      valueString: 'test string'
    };

    const result = parseItemInitialToAnswer(initial);

    expect(result).toEqual({ valueString: 'test string' });
  });

  test('should parse valueBoolean initial value', () => {
    const initial: QuestionnaireItemInitial = {
      valueBoolean: true
    };

    const result = parseItemInitialToAnswer(initial);

    expect(result).toEqual({ valueBoolean: true });
  });

  test('should parse valueDecimal initial value', () => {
    const initial: QuestionnaireItemInitial = {
      valueDecimal: 3.14
    };

    const result = parseItemInitialToAnswer(initial);

    expect(result).toEqual({ valueDecimal: 3.14 });
  });

  test('should parse valueInteger initial value', () => {
    const initial: QuestionnaireItemInitial = {
      valueInteger: 42
    };

    const result = parseItemInitialToAnswer(initial);

    expect(result).toEqual({ valueInteger: 42 });
  });

  test('should parse valueDate initial value', () => {
    const initial: QuestionnaireItemInitial = {
      valueDate: '2025-01-01'
    };

    const result = parseItemInitialToAnswer(initial);

    expect(result).toEqual({ valueDate: '2025-01-01' });
  });

  test('should parse valueDateTime initial value', () => {
    const initial: QuestionnaireItemInitial = {
      valueDateTime: '2025-01-01T12:00:00Z'
    };

    const result = parseItemInitialToAnswer(initial);

    expect(result).toEqual({ valueDateTime: '2025-01-01T12:00:00Z' });
  });

  test('should parse valueTime initial value', () => {
    const initial: QuestionnaireItemInitial = {
      valueTime: '12:00:00'
    };

    const result = parseItemInitialToAnswer(initial);

    expect(result).toEqual({ valueTime: '12:00:00' });
  });

  test('should parse valueUri initial value', () => {
    const initial: QuestionnaireItemInitial = {
      valueUri: 'http://example.com'
    };

    const result = parseItemInitialToAnswer(initial);

    expect(result).toEqual({ valueUri: 'http://example.com' });
  });

  test('should parse valueAttachment initial value', () => {
    const attachment = {
      contentType: 'text/plain',
      data: 'SGVsbG8gV29ybGQ='
    };

    const initial: QuestionnaireItemInitial = {
      valueAttachment: attachment
    };

    const result = parseItemInitialToAnswer(initial);

    expect(result).toEqual({ valueAttachment: attachment });
  });

  test('should parse valueCoding initial value', () => {
    const coding = {
      system: 'http://snomed.info/sct',
      code: '12345',
      display: 'Test Code'
    };

    const initial: QuestionnaireItemInitial = {
      valueCoding: coding
    };

    const result = parseItemInitialToAnswer(initial);

    expect(result).toEqual({ valueCoding: coding });
  });

  test('should parse valueQuantity initial value', () => {
    const quantity = {
      value: 100,
      unit: 'kg',
      system: 'http://unitsofmeasure.org',
      code: 'kg'
    };

    const initial: QuestionnaireItemInitial = {
      valueQuantity: quantity
    };

    const result = parseItemInitialToAnswer(initial);

    expect(result).toEqual({ valueQuantity: quantity });
  });

  test('should parse valueReference initial value', () => {
    const reference = {
      reference: 'Patient/123',
      display: 'John Doe'
    };

    const initial: QuestionnaireItemInitial = {
      valueReference: reference
    };

    const result = parseItemInitialToAnswer(initial);

    expect(result).toEqual({ valueReference: reference });
  });

  test('should return null for initial value with no recognized properties', () => {
    const initial: QuestionnaireItemInitial = {} as QuestionnaireItemInitial;

    const result = parseItemInitialToAnswer(initial);

    expect(result).toBeNull();
  });
});
