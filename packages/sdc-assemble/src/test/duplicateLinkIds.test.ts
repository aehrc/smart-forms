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
import { resolveDuplicateLinkIds } from '../utils/duplicateLinkIds';

describe('resolveDuplicateLinkIds', () => {
  it('should add prefix to duplicate linkIds', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'duplicateId',
      type: 'string'
    };

    const linkIds = new Set(['duplicateId', 'otherId']);
    const duplicateLinkIds: Record<string, string> = {};

    const result = resolveDuplicateLinkIds(qItem, linkIds, duplicateLinkIds);

    expect(result).not.toBeNull();
    expect(result?.linkId).toBe('linkIdPrefix-duplicateId');
    expect(duplicateLinkIds['duplicateId']).toBe('linkIdPrefix-duplicateId');
  });

  it('should return null for non-duplicate linkIds', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'uniqueId',
      type: 'string'
    };

    const linkIds = new Set(['otherId']);
    const duplicateLinkIds: Record<string, string> = {};

    const result = resolveDuplicateLinkIds(qItem, linkIds, duplicateLinkIds);

    expect(result).toBeNull();
    expect(Object.keys(duplicateLinkIds)).toHaveLength(0);
  });

  it('should handle nested items and resolve duplicates recursively', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'parent',
      type: 'group',
      item: [
        {
          linkId: 'childDuplicate',
          type: 'string'
        },
        {
          linkId: 'childUnique',
          type: 'string'
        }
      ]
    };

    const linkIds = new Set(['childDuplicate', 'existingId']);
    const duplicateLinkIds: Record<string, string> = {};

    const result = resolveDuplicateLinkIds(qItem, linkIds, duplicateLinkIds);

    expect(result).not.toBeNull();
    expect(result?.item?.[0]?.linkId).toBe('linkIdPrefix-childDuplicate');
    expect(result?.item?.[1]?.linkId).toBe('childUnique');
    expect(duplicateLinkIds['childDuplicate']).toBe('linkIdPrefix-childDuplicate');
  });

  it('should increment prefix when linkIdPrefix already exists', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'duplicateId',
      type: 'string'
    };

    const linkIds = new Set(['duplicateId', 'linkIdPrefix-duplicateId']);
    const duplicateLinkIds: Record<string, string> = {};

    const result = resolveDuplicateLinkIds(qItem, linkIds, duplicateLinkIds);

    expect(result).not.toBeNull();
    expect(result?.linkId).toBe('linkIdPrefix-1-duplicateId');
    expect(duplicateLinkIds['duplicateId']).toBe('linkIdPrefix-1-duplicateId');
  });

  it('should increment prefix count multiple times if needed', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'duplicateId',
      type: 'string'
    };

    const linkIds = new Set([
      'duplicateId',
      'linkIdPrefix-duplicateId',
      'linkIdPrefix-1-duplicateId',
      'linkIdPrefix-2-duplicateId'
    ]);
    const duplicateLinkIds: Record<string, string> = {};

    const result = resolveDuplicateLinkIds(qItem, linkIds, duplicateLinkIds);

    expect(result).not.toBeNull();
    expect(result?.linkId).toBe('linkIdPrefix-3-duplicateId');
    expect(duplicateLinkIds['duplicateId']).toBe('linkIdPrefix-3-duplicateId');
  });

  it('should handle parent item being duplicate', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'parentDuplicate',
      type: 'group',
      item: [
        {
          linkId: 'child1',
          type: 'string'
        }
      ]
    };

    const linkIds = new Set(['parentDuplicate', 'child1']);
    const duplicateLinkIds: Record<string, string> = {};

    const result = resolveDuplicateLinkIds(qItem, linkIds, duplicateLinkIds);

    expect(result).not.toBeNull();
    expect(result?.linkId).toBe('linkIdPrefix-parentDuplicate');
    expect(result?.item?.[0]?.linkId).toBe('linkIdPrefix-child1');
    expect(duplicateLinkIds['parentDuplicate']).toBe('linkIdPrefix-parentDuplicate');
    expect(duplicateLinkIds['child1']).toBe('linkIdPrefix-child1');
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
              linkId: 'deepDuplicate',
              type: 'string'
            }
          ]
        }
      ]
    };

    const linkIds = new Set(['deepDuplicate']);
    const duplicateLinkIds: Record<string, string> = {};

    const result = resolveDuplicateLinkIds(qItem, linkIds, duplicateLinkIds);

    expect(result).not.toBeNull();
    expect(result?.item?.[0]?.item?.[0]?.linkId).toBe('linkIdPrefix-deepDuplicate');
    expect(duplicateLinkIds['deepDuplicate']).toBe('linkIdPrefix-deepDuplicate');
  });

  it('should handle empty item array', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'uniqueId',
      type: 'group',
      item: []
    };

    const linkIds = new Set(['otherId']);
    const duplicateLinkIds: Record<string, string> = {};

    const result = resolveDuplicateLinkIds(qItem, linkIds, duplicateLinkIds);

    expect(result).toBeNull();
  });

  it('should handle item with no children', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'uniqueId',
      type: 'string'
      // No item property
    };

    const linkIds = new Set(['otherId']);
    const duplicateLinkIds: Record<string, string> = {};

    const result = resolveDuplicateLinkIds(qItem, linkIds, duplicateLinkIds);

    expect(result).toBeNull();
  });

  it('should update linkIds set during processing', () => {
    const qItem: QuestionnaireItem = {
      linkId: 'parent',
      type: 'group',
      item: [
        {
          linkId: 'child1',
          type: 'string'
        },
        {
          linkId: 'child2',
          type: 'string'
        }
      ]
    };

    const linkIds = new Set(['child1']);
    const duplicateLinkIds: Record<string, string> = {};

    const result = resolveDuplicateLinkIds(qItem, linkIds, duplicateLinkIds);

    // After processing, linkIds should contain the new linkIds
    expect(linkIds.has('linkIdPrefix-child1')).toBe(true);
    expect(linkIds.has('child2')).toBe(true);
    expect(result?.item?.[0]?.linkId).toBe('linkIdPrefix-child1');
    expect(result?.item?.[1]?.linkId).toBe('child2');
  });
});
