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
import type { QuestionnaireItem } from 'fhir/r4';
import { resolveDuplicateEnableWhen } from '../utils/duplicateEnableWhen';

describe('resolveDuplicateEnableWhen', () => {
  it('should resolve duplicate linkIds in enableWhen questions', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'group1',
      type: 'group',
      enableWhen: [
        {
          question: 'originalLinkId',
          operator: 'exists',
          answerBoolean: true
        }
      ],
      item: [
        {
          linkId: 'child1',
          type: 'string',
          enableWhen: [
            {
              question: 'duplicateLinkId',
              operator: '=',
              answerString: 'test'
            }
          ]
        }
      ]
    };

    const duplicateLinkIds = {
      originalLinkId: 'linkIdPrefix-originalLinkId',
      duplicateLinkId: 'linkIdPrefix-duplicateLinkId'
    };

    const result = resolveDuplicateEnableWhen(qItem, duplicateLinkIds);

    expect(result.enableWhen?.[0]?.question).toBe('linkIdPrefix-originalLinkId');
    expect(result.item?.[0]?.enableWhen?.[0]?.question).toBe('linkIdPrefix-duplicateLinkId');
  });

  it('should not modify enableWhen questions that are not in duplicate list', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'group1',
      type: 'group',
      enableWhen: [
        {
          question: 'uniqueLinkId',
          operator: 'exists',
          answerBoolean: true
        }
      ]
    };

    const duplicateLinkIds = {
      otherLinkId: 'linkIdPrefix-otherLinkId'
    };

    const result = resolveDuplicateEnableWhen(qItem, duplicateLinkIds);

    expect(result.enableWhen?.[0]?.question).toBe('uniqueLinkId');
  });

  it('should handle items without enableWhen', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'group1',
      type: 'group',
      item: [
        {
          linkId: 'child1',
          type: 'string'
        }
      ]
    };

    const duplicateLinkIds = {
      someLinkId: 'linkIdPrefix-someLinkId'
    };

    const result = resolveDuplicateEnableWhen(qItem, duplicateLinkIds);

    expect(result.linkId).toBe('group1');
    expect(result.item?.[0]?.linkId).toBe('child1');
  });

  it('should handle deeply nested items', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'root',
      type: 'group',
      item: [
        {
          linkId: 'level1',
          type: 'group',
          item: [
            {
              linkId: 'level2',
              type: 'string',
              enableWhen: [
                {
                  question: 'deepDuplicate',
                  operator: '=',
                  answerString: 'value'
                }
              ]
            }
          ]
        }
      ]
    };

    const duplicateLinkIds = {
      deepDuplicate: 'linkIdPrefix-deepDuplicate'
    };

    const result = resolveDuplicateEnableWhen(qItem, duplicateLinkIds);

    expect(result.item?.[0]?.item?.[0]?.enableWhen?.[0]?.question).toBe(
      'linkIdPrefix-deepDuplicate'
    );
  });

  it('should handle multiple enableWhen conditions', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'item1',
      type: 'string',
      enableWhen: [
        {
          question: 'duplicate1',
          operator: '=',
          answerString: 'value1'
        },
        {
          question: 'unique1',
          operator: '=',
          answerString: 'value2'
        },
        {
          question: 'duplicate2',
          operator: 'exists',
          answerBoolean: true
        }
      ]
    };

    const duplicateLinkIds = {
      duplicate1: 'linkIdPrefix-duplicate1',
      duplicate2: 'linkIdPrefix-duplicate2'
    };

    const result = resolveDuplicateEnableWhen(qItem, duplicateLinkIds);

    expect(result.enableWhen?.[0]?.question).toBe('linkIdPrefix-duplicate1');
    expect(result.enableWhen?.[1]?.question).toBe('unique1');
    expect(result.enableWhen?.[2]?.question).toBe('linkIdPrefix-duplicate2');
  });

  it('should handle empty enableWhen array', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'item1',
      type: 'string',
      enableWhen: []
    };

    const duplicateLinkIds = {
      someLinkId: 'linkIdPrefix-someLinkId'
    };

    const result = resolveDuplicateEnableWhen(qItem, duplicateLinkIds);

    expect(result.enableWhen).toEqual([]);
  });

  it('should preserve other properties of enableWhen conditions', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'item1',
      type: 'string',
      enableWhen: [
        {
          question: 'duplicateId',
          operator: '=',
          answerString: 'testValue'
        }
      ],
      enableBehavior: 'all'
    };

    const duplicateLinkIds = {
      duplicateId: 'linkIdPrefix-duplicateId'
    };

    const result = resolveDuplicateEnableWhen(qItem, duplicateLinkIds);

    expect(result.enableWhen?.[0]).toEqual({
      question: 'linkIdPrefix-duplicateId',
      operator: '=',
      answerString: 'testValue'
    });
    expect(result.enableBehavior).toBe('all');
  });
});
