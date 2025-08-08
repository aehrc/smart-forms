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

import {
  updateQuestionnaireResponse,
  readQuestionnaireResponse,
  traverseQuestionnaire,
  type RecursiveUpdateFunction,
  type RecursiveReadArrayFunction,
  type RecursiveTraverseFunction
} from '../utils/genericRecursive';
import type { Questionnaire, QuestionnaireItem, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';

// Mock the dependencies
jest.mock('../utils/manageForm', () => ({
  qrItemHasItemsOrAnswer: jest.fn()
}));

import { qrItemHasItemsOrAnswer } from '../utils/manageForm';
const mockQrItemHasItemsOrAnswer = qrItemHasItemsOrAnswer as jest.MockedFunction<typeof qrItemHasItemsOrAnswer>;

describe('genericRecursive', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateQuestionnaireResponse', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      item: [
        { linkId: 'item1', type: 'string', text: 'First item' },
        { linkId: 'item2', type: 'group', text: 'Group item' }
      ]
    };

    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      item: [
        { linkId: 'item1', answer: [{ valueString: 'test answer' }] }
      ]
    };

    it('should return original response when questionnaire has no items', () => {
      const emptyQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active'
        // no item property
      };

      const updateFunction: RecursiveUpdateFunction<string> = jest.fn();
      
      const result = updateQuestionnaireResponse(
        emptyQuestionnaire,
        questionnaireResponse,
        updateFunction,
        'extraData'
      );

      expect(result).toBe(questionnaireResponse);
      expect(updateFunction).not.toHaveBeenCalled();
    });

    it('should return original response when questionnaire has empty items array', () => {
      const emptyQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: []
      };

      const updateFunction: RecursiveUpdateFunction<string> = jest.fn();
      
      const result = updateQuestionnaireResponse(
        emptyQuestionnaire,
        questionnaireResponse,
        updateFunction,
        'extraData'
      );

      expect(result).toBe(questionnaireResponse);
      expect(updateFunction).not.toHaveBeenCalled();
    });

    it('should return original response when questionnaireResponse has no items', () => {
      const emptyResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress'
        // no item property
      };

      const updateFunction: RecursiveUpdateFunction<string> = jest.fn();
      
      const result = updateQuestionnaireResponse(
        questionnaire,
        emptyResponse,
        updateFunction,
        'extraData'
      );

      expect(result).toBe(emptyResponse);
      expect(updateFunction).not.toHaveBeenCalled();
    });

    it('should return original response when questionnaireResponse has empty items array', () => {
      const emptyResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        item: []
      };

      const updateFunction: RecursiveUpdateFunction<string> = jest.fn();
      
      const result = updateQuestionnaireResponse(
        questionnaire,
        emptyResponse,
        updateFunction,
        'extraData'
      );

      expect(result).toBe(emptyResponse);
      expect(updateFunction).not.toHaveBeenCalled();
    });

    it('should call update function for each questionnaire item', () => {
      const updateFunction: RecursiveUpdateFunction<string> = jest.fn().mockReturnValue(null);
      mockQrItemHasItemsOrAnswer.mockReturnValue(false);

      updateQuestionnaireResponse(questionnaire, questionnaireResponse, updateFunction, 'testData');

      expect(updateFunction).toHaveBeenCalledTimes(2);
      expect(updateFunction).toHaveBeenNthCalledWith(
        1,
        questionnaire.item![0],
        questionnaireResponse.item![0],
        'testData'
      );
      expect(updateFunction).toHaveBeenNthCalledWith(
        2,
        questionnaire.item![1],
        expect.objectContaining({
          linkId: 'item2',
          text: 'Group item',
          item: []
        }),
        'testData'
      );
    });

    it('should include valid updated items in result', () => {
      const updatedItem: QuestionnaireResponseItem = {
        linkId: 'item1',
        answer: [{ valueString: 'updated answer' }]
      };

      const updateFunction: RecursiveUpdateFunction<string> = jest.fn()
        .mockReturnValueOnce(updatedItem)
        .mockReturnValueOnce(null);

      mockQrItemHasItemsOrAnswer.mockReturnValue(true);

      const result = updateQuestionnaireResponse(
        questionnaire,
        questionnaireResponse,
        updateFunction,
        'testData'
      );

      expect(result.item).toHaveLength(1);
      expect(result.item![0]).toBe(updatedItem);
    });

    it('should handle array returns from update function', () => {
      const updatedItems: QuestionnaireResponseItem[] = [
        { linkId: 'item1', answer: [{ valueString: 'first' }] },
        { linkId: 'item1', answer: [{ valueString: 'second' }] }
      ];

      const updateFunction: RecursiveUpdateFunction<string> = jest.fn()
        .mockReturnValueOnce(updatedItems)
        .mockReturnValueOnce(null);

      const result = updateQuestionnaireResponse(
        questionnaire,
        questionnaireResponse,
        updateFunction,
        'testData'
      );

      expect(result.item).toHaveLength(2);
      expect(result.item).toEqual(updatedItems);
    });

    it('should skip empty arrays from update function', () => {
      const updateFunction: RecursiveUpdateFunction<string> = jest.fn()
        .mockReturnValueOnce([]) // empty array should be skipped
        .mockReturnValueOnce(null);

      const result = updateQuestionnaireResponse(
        questionnaire,
        questionnaireResponse,
        updateFunction,
        'testData'
      );

      expect(result.item).toHaveLength(0);
    });

    it('should filter out items that fail qrItemHasItemsOrAnswer check', () => {
      const updatedItem: QuestionnaireResponseItem = {
        linkId: 'item1'
        // no answer or item - should fail qrItemHasItemsOrAnswer
      };

      const updateFunction: RecursiveUpdateFunction<string> = jest.fn()
        .mockReturnValueOnce(updatedItem)
        .mockReturnValueOnce(null);

      mockQrItemHasItemsOrAnswer.mockReturnValue(false); // fail the check

      const result = updateQuestionnaireResponse(
        questionnaire,
        questionnaireResponse,
        updateFunction,
        'testData'
      );

      expect(result.item).toHaveLength(0);
      expect(mockQrItemHasItemsOrAnswer).toHaveBeenCalledWith(updatedItem);
    });
  });

  describe('readQuestionnaireResponse', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      item: [
        { linkId: 'item1', type: 'string', text: 'First item' },
        { linkId: 'item2', type: 'integer', text: 'Second item' }
      ]
    };

    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      item: [
        { linkId: 'item1', answer: [{ valueString: 'test' }] }
      ]
    };

    it('should return empty array when questionnaire has no items', () => {
      const emptyQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active'
        // no item property
      };

      const readFunction: RecursiveReadArrayFunction<string, number> = jest.fn();

      const result = readQuestionnaireResponse(
        emptyQuestionnaire,
        questionnaireResponse,
        readFunction
      );

      expect(result).toEqual([]);
      expect(readFunction).not.toHaveBeenCalled();
    });

    it('should return empty array when questionnaire has empty items array', () => {
      const emptyQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: []
      };

      const readFunction: RecursiveReadArrayFunction<string, number> = jest.fn();

      const result = readQuestionnaireResponse(
        emptyQuestionnaire,
        questionnaireResponse,
        readFunction
      );

      expect(result).toEqual([]);
      expect(readFunction).not.toHaveBeenCalled();
    });

    it('should handle questionnaireResponse with no items', () => {
      const emptyResponse: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress'
        // no item property
      };

      const readFunction: RecursiveReadArrayFunction<string, number> = jest.fn()
        .mockReturnValueOnce(['value1'])
        .mockReturnValueOnce(['value2']);

      const result = readQuestionnaireResponse(
        questionnaire,
        emptyResponse,
        readFunction,
        42
      );

      expect(readFunction).toHaveBeenCalledTimes(2);
      expect(readFunction).toHaveBeenCalledWith(
        questionnaire.item![0],
        expect.objectContaining({
          linkId: 'item1',
          text: 'First item',
          item: []
        }),
        42
      );
      expect(result).toEqual(['value1', 'value2']);
    });

    it('should call read function for each questionnaire item and collect results', () => {
      const readFunction: RecursiveReadArrayFunction<string, number> = jest.fn()
        .mockReturnValueOnce(['value1', 'value2'])
        .mockReturnValueOnce(['value3']);

      const result = readQuestionnaireResponse(
        questionnaire,
        questionnaireResponse,
        readFunction,
        42
      );

      expect(readFunction).toHaveBeenCalledTimes(2);
      expect(readFunction).toHaveBeenNthCalledWith(
        1,
        questionnaire.item![0],
        questionnaireResponse.item![0],
        42
      );
      expect(readFunction).toHaveBeenNthCalledWith(
        2,
        questionnaire.item![1],
        expect.objectContaining({
          linkId: 'item2',
          text: 'Second item',
          item: []
        }),
        42
      );
      expect(result).toEqual(['value1', 'value2', 'value3']);
    });

    it('should handle null returns from read function', () => {
      const readFunction: RecursiveReadArrayFunction<string, number> = jest.fn()
        .mockReturnValueOnce(['value1'])
        .mockReturnValueOnce(null); // null should be ignored

      const result = readQuestionnaireResponse(
        questionnaire,
        questionnaireResponse,
        readFunction
      );

      expect(result).toEqual(['value1']);
    });

    it('should work without extraData parameter', () => {
      const readFunction: RecursiveReadArrayFunction<string, undefined> = jest.fn()
        .mockReturnValueOnce(['value1'])
        .mockReturnValueOnce(null);

      const result = readQuestionnaireResponse(
        questionnaire,
        questionnaireResponse,
        readFunction
      );

      expect(readFunction).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        undefined
      );
      expect(result).toEqual(['value1']);
    });
  });

  describe('traverseQuestionnaire', () => {
    it('should return early when questionnaire has no items', () => {
      const emptyQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active'
        // no item property
      };

      const traverseFunction: RecursiveTraverseFunction<string> = jest.fn();

      traverseQuestionnaire(emptyQuestionnaire, traverseFunction, 'testData');

      expect(traverseFunction).not.toHaveBeenCalled();
    });

    it('should return early when questionnaire has empty items array', () => {
      const emptyQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: []
      };

      const traverseFunction: RecursiveTraverseFunction<string> = jest.fn();

      traverseQuestionnaire(emptyQuestionnaire, traverseFunction, 'testData');

      expect(traverseFunction).not.toHaveBeenCalled();
    });

    it('should call traverse function for each top-level item', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          { linkId: 'item1', type: 'string', text: 'First item' },
          { linkId: 'item2', type: 'group', text: 'Group item' },
          { linkId: 'item3', type: 'boolean', text: 'Third item' }
        ]
      };

      const traverseFunction: RecursiveTraverseFunction<string> = jest.fn();

      traverseQuestionnaire(questionnaire, traverseFunction, 'testData');

      expect(traverseFunction).toHaveBeenCalledTimes(3);
      expect(traverseFunction).toHaveBeenNthCalledWith(
        1,
        questionnaire.item![0],
        questionnaire,
        undefined,
        'testData'
      );
      expect(traverseFunction).toHaveBeenNthCalledWith(
        2,
        questionnaire.item![1],
        questionnaire,
        undefined,
        'testData'
      );
      expect(traverseFunction).toHaveBeenNthCalledWith(
        3,
        questionnaire.item![2],
        questionnaire,
        undefined,
        'testData'
      );
    });

    it('should work without extraData parameter', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          { linkId: 'item1', type: 'string', text: 'First item' }
        ]
      };

      const traverseFunction: RecursiveTraverseFunction<undefined> = jest.fn();

      traverseQuestionnaire(questionnaire, traverseFunction);

      expect(traverseFunction).toHaveBeenCalledWith(
        questionnaire.item![0],
        questionnaire,
        undefined,
        undefined
      );
    });
  });
});
