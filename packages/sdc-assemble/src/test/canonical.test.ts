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
import type { Questionnaire, QuestionnaireItem } from 'fhir/r4';
import { alignItemsWithParentForm, getCanonicalUrls } from '../utils/canonical';

describe('getCanonicalUrls', () => {
  const mockParentQuestionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    id: 'parent-questionnaire',
    status: 'draft',
    url: 'http://example.com/parent-questionnaire',
    item: [
      {
        linkId: 'root',
        type: 'group',
        item: [
          {
            linkId: 'item1',
            type: 'display',
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
                valueCanonical: 'http://example.com/sub-questionnaire-1|1.0.0'
              }
            ]
          },
          {
            linkId: 'item2',
            type: 'display',
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
                valueCanonical: 'http://example.com/sub-questionnaire-2|2.0.0'
              }
            ]
          },
          {
            linkId: 'item3',
            type: 'display'
            // No subQuestionnaire extension
          }
        ]
      }
    ]
  };

  it('should extract canonical URLs from subquestionnaire extensions (root questionnaire)', () => {
    const totalCanonicals: string[] = [];
    const result = getCanonicalUrls(mockParentQuestionnaire, totalCanonicals, true);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual([
      'http://example.com/sub-questionnaire-1|1.0.0',
      'http://example.com/sub-questionnaire-2|2.0.0'
    ]);
  });

  it('should return error if root questionnaire does not have valid item structure', () => {
    const invalidQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'invalid',
      status: 'draft'
    };

    const totalCanonicals: string[] = [];
    const result = getCanonicalUrls(invalidQuestionnaire, totalCanonicals, true);

    expect(result).toEqual({
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'invalid',
          details: {
            text: 'Root questionnaire invalid does not have a valid nested item (parentQuestionnaire.item[x].item) for assembly.'
          }
        }
      ]
    });
  });

  it('should return error if root questionnaire item has no child items', () => {
    const emptyItemQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'empty-items',
      status: 'draft',
      item: [
        {
          linkId: 'root',
          type: 'group'
          // No item array
        }
      ]
    };

    const totalCanonicals: string[] = [];
    const result = getCanonicalUrls(emptyItemQuestionnaire, totalCanonicals, true);

    expect(result).toEqual({
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'invalid',
          details: {
            text: 'Root questionnaire empty-items does not have a valid nested item (parentQuestionnaire.item[x].item) for assembly.'
          }
        }
      ]
    });
  });

  it('should detect circular dependency and return error', () => {
    const totalCanonicals: string[] = [
      'http://example.com/sub-questionnaire-1|1.0.0',
      'http://example.com/other-questionnaire|1.0.0'
    ];
    const result = getCanonicalUrls(mockParentQuestionnaire, totalCanonicals, true);

    expect(result).toEqual({
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'invalid',
          details: {
            text: 'parent-questionnaire contains a circular dependency on the questionnaire http://example.com/sub-questionnaire-1|1.0.0'
          }
        }
      ]
    });
  });

  it('should skip items without subquestionnaire extensions', () => {
    const mixedQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'mixed',
      status: 'draft',
      item: [
        {
          linkId: 'root',
          type: 'group',
          item: [
            {
              linkId: 'item1',
              type: 'display',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
                  valueCanonical: 'http://example.com/sub-questionnaire-1|1.0.0'
                }
              ]
            },
            {
              linkId: 'item2',
              type: 'string'
              // No extensions
            },
            {
              linkId: 'item3',
              type: 'display',
              extension: [
                {
                  url: 'http://other.extension',
                  valueString: 'other value'
                }
              ]
            }
          ]
        }
      ]
    };

    const totalCanonicals: string[] = [];
    const result = getCanonicalUrls(mixedQuestionnaire, totalCanonicals, true);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual(['http://example.com/sub-questionnaire-1|1.0.0']);
  });

  it('should return empty array when no subquestionnaire extensions are found', () => {
    const noSubquestionnairesQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: 'no-subquestionnaires',
      status: 'draft',
      item: [
        {
          linkId: 'root',
          type: 'group',
          item: [
            {
              linkId: 'item1',
              type: 'string'
            },
            {
              linkId: 'item2',
              type: 'display'
            }
          ]
        }
      ]
    };

    const totalCanonicals: string[] = [];
    const result = getCanonicalUrls(noSubquestionnairesQuestionnaire, totalCanonicals, true);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual([]);
  });

  // Tests for isRoot: false scenarios
  describe('when isRoot is false (subquestionnaire)', () => {
    it('should extract canonical URLs from subquestionnaire extensions', () => {
      const totalCanonicals: string[] = [];
      const result = getCanonicalUrls(mockParentQuestionnaire, totalCanonicals, false);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([
        'http://example.com/sub-questionnaire-1|1.0.0',
        'http://example.com/sub-questionnaire-2|2.0.0'
      ]);
    });

    it('should return empty array if subquestionnaire does not have valid item structure', () => {
      const invalidQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'invalid-sub',
        status: 'draft'
      };

      const totalCanonicals: string[] = [];
      const result = getCanonicalUrls(invalidQuestionnaire, totalCanonicals, false);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([]);
    });

    it('should return empty array if subquestionnaire item has no child items', () => {
      const emptyItemQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'empty-items-sub',
        status: 'draft',
        item: [
          {
            linkId: 'root',
            type: 'group'
            // No item array
          }
        ]
      };

      const totalCanonicals: string[] = [];
      const result = getCanonicalUrls(emptyItemQuestionnaire, totalCanonicals, false);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([]);
    });

    it('should still detect circular dependency and return error for subquestionnaire', () => {
      const totalCanonicals: string[] = [
        'http://example.com/sub-questionnaire-1|1.0.0',
        'http://example.com/other-questionnaire|1.0.0'
      ];
      const result = getCanonicalUrls(mockParentQuestionnaire, totalCanonicals, false);

      expect(result).toEqual({
        resourceType: 'OperationOutcome',
        issue: [
          {
            severity: 'error',
            code: 'invalid',
            details: {
              text: 'parent-questionnaire contains a circular dependency on the questionnaire http://example.com/sub-questionnaire-1|1.0.0'
            }
          }
        ]
      });
    });

    it('should return empty array when no subquestionnaire extensions are found in subquestionnaire', () => {
      const noSubquestionnairesQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'no-subquestionnaires',
        status: 'draft',
        item: [
          {
            linkId: 'root',
            type: 'group',
            item: [
              {
                linkId: 'item1',
                type: 'string'
              },
              {
                linkId: 'item2',
                type: 'display'
              }
            ]
          }
        ]
      };

      const totalCanonicals: string[] = [];
      const result = getCanonicalUrls(noSubquestionnairesQuestionnaire, totalCanonicals, false);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([]);
    });
  });
});

describe('alignItemsWithParentForm', () => {
  const subQuestionnaireItem = (linkId: string, canonical: string): QuestionnaireItem => ({
    linkId,
    type: 'display',
    extension: [
      {
        url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
        valueCanonical: canonical
      }
    ]
  });

  const buildParent = (formItems: QuestionnaireItem[]): Questionnaire => ({
    resourceType: 'Questionnaire',
    id: 'parent',
    status: 'draft',
    item: [{ linkId: 'form', type: 'group', item: formItems }]
  });

  it('aligns compact subquestionnaire items to a regular item mixed before a placeholder', () => {
    // Form order: [regular question, placeholder]. getItems() only sees the one subquestionnaire,
    // so its compact list has a single entry at index 0.
    const parent = buildParent([
      { linkId: 'realQuestion', type: 'string' },
      subQuestionnaireItem('placeholder', 'http://example.com/child')
    ]);
    const childItems: QuestionnaireItem[] = [
      { linkId: 'childA', type: 'boolean' },
      { linkId: 'childB', type: 'date' }
    ];

    const aligned = alignItemsWithParentForm(parent, [childItems]);

    // The child items land at the placeholder's position (index 1), not the regular item (index 0).
    expect(aligned).toEqual([null, childItems]);
  });

  it('aligns multiple placeholders interleaved with regular items', () => {
    const parent = buildParent([
      subQuestionnaireItem('placeholderA', 'http://example.com/childA'),
      { linkId: 'realQuestion', type: 'string' },
      subQuestionnaireItem('placeholderB', 'http://example.com/childB')
    ]);
    const childAItems: QuestionnaireItem[] = [{ linkId: 'a', type: 'boolean' }];
    const childBItems: QuestionnaireItem[] = [{ linkId: 'b', type: 'date' }];

    const aligned = alignItemsWithParentForm(parent, [childAItems, childBItems]);

    expect(aligned).toEqual([childAItems, null, childBItems]);
  });

  it('leaves an all-placeholder form unchanged (index-for-index)', () => {
    const parent = buildParent([
      subQuestionnaireItem('placeholderA', 'http://example.com/childA'),
      subQuestionnaireItem('placeholderB', 'http://example.com/childB')
    ]);
    const childAItems: QuestionnaireItem[] = [{ linkId: 'a', type: 'boolean' }];
    const childBItems: QuestionnaireItem[] = [{ linkId: 'b', type: 'date' }];

    const aligned = alignItemsWithParentForm(parent, [childAItems, childBItems]);

    expect(aligned).toEqual([childAItems, childBItems]);
  });

  it('returns the compact list untouched when the parent has no form items', () => {
    const parent: Questionnaire = { resourceType: 'Questionnaire', id: 'empty', status: 'draft' };
    const compact = [[{ linkId: 'a', type: 'boolean' } as QuestionnaireItem]];

    expect(alignItemsWithParentForm(parent, compact)).toBe(compact);
  });
});
