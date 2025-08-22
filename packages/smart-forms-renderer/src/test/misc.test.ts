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

import { describe, expect, test } from '@jest/globals';
import type {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem
} from 'fhir/r4';
import {
  getQuestionnaireItem,
  getQuestionnaireResponseItem,
  replaceQuestionnaireResponseItem,
  getParentItem,
  getRepeatGroupParentItem,
  getSectionHeading,
  getSectionHeadingRecursive,
  isItemInGrid,
  getQuestionnaireResponseItemViaFhirPath
} from '../utils/misc';

describe('getQuestionnaireItem', () => {
  const mockQuestionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    status: 'active',
    item: [
      {
        linkId: 'top-level-1',
        type: 'string',
        text: 'Top Level Item 1'
      },
      {
        linkId: 'group-1',
        type: 'group',
        text: 'Group Item',
        item: [
          {
            linkId: 'nested-1',
            type: 'integer',
            text: 'Nested Item 1'
          },
          {
            linkId: 'nested-group',
            type: 'group',
            text: 'Nested Group',
            item: [
              {
                linkId: 'deeply-nested',
                type: 'boolean',
                text: 'Deeply Nested Item'
              }
            ]
          }
        ]
      }
    ]
  };

  it('should find top-level item by linkId', () => {
    const result = getQuestionnaireItem(mockQuestionnaire, 'top-level-1');
    expect(result).toEqual({
      linkId: 'top-level-1',
      type: 'string',
      text: 'Top Level Item 1'
    });
  });

  it('should find nested item by linkId', () => {
    const result = getQuestionnaireItem(mockQuestionnaire, 'nested-1');
    expect(result).toEqual({
      linkId: 'nested-1',
      type: 'integer',
      text: 'Nested Item 1'
    });
  });

  it('should find deeply nested item by linkId', () => {
    const result = getQuestionnaireItem(mockQuestionnaire, 'deeply-nested');
    expect(result).toEqual({
      linkId: 'deeply-nested',
      type: 'boolean',
      text: 'Deeply Nested Item'
    });
  });

  it('should return null when item not found', () => {
    const result = getQuestionnaireItem(mockQuestionnaire, 'non-existent');
    expect(result).toBeNull();
  });

  it('should handle questionnaire with no items', () => {
    const emptyQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active'
    };
    const result = getQuestionnaireItem(emptyQuestionnaire, 'any-id');
    expect(result).toBeNull();
  });

  it('should handle questionnaire with empty items array', () => {
    const emptyQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      item: []
    };
    const result = getQuestionnaireItem(emptyQuestionnaire, 'any-id');
    expect(result).toBeNull();
  });
});

describe('getQuestionnaireResponseItem', () => {
  const mockQuestionnaireResponse: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
    item: [
      {
        linkId: 'top-level-1',
        text: 'Top Level Item 1',
        answer: [{ valueString: 'test value' }]
      },
      {
        linkId: 'group-1',
        text: 'Group Item',
        item: [
          {
            linkId: 'nested-1',
            text: 'Nested Item 1',
            answer: [{ valueInteger: 42 }]
          },
          {
            linkId: 'nested-group',
            text: 'Nested Group',
            item: [
              {
                linkId: 'deeply-nested',
                text: 'Deeply Nested Item',
                answer: [{ valueBoolean: true }]
              }
            ]
          }
        ]
      }
    ]
  };

  it('should find top-level response item by linkId', () => {
    const result = getQuestionnaireResponseItem(mockQuestionnaireResponse, 'top-level-1');
    expect(result).toEqual({
      linkId: 'top-level-1',
      text: 'Top Level Item 1',
      answer: [{ valueString: 'test value' }]
    });
  });

  it('should find nested response item by linkId', () => {
    const result = getQuestionnaireResponseItem(mockQuestionnaireResponse, 'nested-1');
    expect(result).toEqual({
      linkId: 'nested-1',
      text: 'Nested Item 1',
      answer: [{ valueInteger: 42 }]
    });
  });

  it('should find deeply nested response item by linkId', () => {
    const result = getQuestionnaireResponseItem(mockQuestionnaireResponse, 'deeply-nested');
    expect(result).toEqual({
      linkId: 'deeply-nested',
      text: 'Deeply Nested Item',
      answer: [{ valueBoolean: true }]
    });
  });

  it('should return null when response item not found', () => {
    const result = getQuestionnaireResponseItem(mockQuestionnaireResponse, 'non-existent');
    expect(result).toBeNull();
  });

  it('should handle response with no items', () => {
    const emptyResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress'
    };
    const result = getQuestionnaireResponseItem(emptyResponse, 'any-id');
    expect(result).toBeNull();
  });
});

describe('replaceQuestionnaireResponseItem', () => {
  const mockQuestionnaireResponse: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
    item: [
      {
        linkId: 'item-1',
        text: 'Item 1',
        answer: [{ valueString: 'original' }]
      },
      {
        linkId: 'group-1',
        text: 'Group 1',
        item: [
          {
            linkId: 'nested-item',
            text: 'Nested Item',
            answer: [{ valueString: 'nested original' }]
          }
        ]
      }
    ]
  };

  it('should replace top-level item', () => {
    const newItem: QuestionnaireResponseItem = {
      linkId: 'item-1',
      text: 'Updated Item 1',
      answer: [{ valueString: 'updated' }]
    };

    const result = replaceQuestionnaireResponseItem(mockQuestionnaireResponse, 'item-1', newItem);

    expect(result.item![0]).toEqual(newItem);
    expect(result.item![1]).toEqual(mockQuestionnaireResponse.item![1]); // Other items unchanged
  });

  it('should replace nested item', () => {
    const newItem: QuestionnaireResponseItem = {
      linkId: 'nested-item',
      text: 'Updated Nested Item',
      answer: [{ valueString: 'updated nested' }]
    };

    const result = replaceQuestionnaireResponseItem(
      mockQuestionnaireResponse,
      'nested-item',
      newItem
    );

    expect(result.item![1].item![0]).toEqual(newItem);
  });

  it('should remove item when newQRItem is null', () => {
    const result = replaceQuestionnaireResponseItem(mockQuestionnaireResponse, 'item-1', null);

    expect(result.item).toHaveLength(1);
    expect(result.item![0].linkId).toBe('group-1');
  });

  it('should handle empty response gracefully', () => {
    const emptyResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress'
    };

    const result = replaceQuestionnaireResponseItem(emptyResponse, 'any-id', null);
    expect(result).toEqual(emptyResponse);
  });

  it('should remove item array if it becomes empty', () => {
    const singleItemResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      item: [
        {
          linkId: 'only-item',
          text: 'Only Item'
        }
      ]
    };

    const result = replaceQuestionnaireResponseItem(singleItemResponse, 'only-item', null);
    expect(result.item).toBeUndefined();
  });
});

describe('getParentItem', () => {
  const mockQuestionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    status: 'active',
    item: [
      {
        linkId: 'parent-group',
        type: 'group',
        text: 'Parent Group',
        item: [
          {
            linkId: 'child-item',
            type: 'string',
            text: 'Child Item'
          },
          {
            linkId: 'nested-group',
            type: 'group',
            text: 'Nested Group',
            item: [
              {
                linkId: 'grandchild-item',
                type: 'integer',
                text: 'Grandchild Item'
              }
            ]
          }
        ]
      }
    ]
  };

  it('should find parent item of child', () => {
    const result = getParentItem(mockQuestionnaire, 'child-item');
    expect(result?.linkId).toBe('parent-group');
  });

  it('should find parent item of grandchild', () => {
    const result = getParentItem(mockQuestionnaire, 'grandchild-item');
    expect(result?.linkId).toBe('nested-group');
  });

  it('should return null for top-level item', () => {
    const result = getParentItem(mockQuestionnaire, 'parent-group');
    expect(result).toBeNull();
  });

  it('should return null for non-existent item', () => {
    const result = getParentItem(mockQuestionnaire, 'non-existent');
    expect(result).toBeNull();
  });
});

describe('getRepeatGroupParentItem', () => {
  const mockQuestionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    status: 'active',
    item: [
      {
        linkId: 'regular-group',
        type: 'group',
        text: 'Regular Group',
        item: [
          {
            linkId: 'repeat-group',
            type: 'group',
            text: 'Repeat Group',
            repeats: true,
            item: [
              {
                linkId: 'repeat-child',
                type: 'string',
                text: 'Child in Repeat Group'
              }
            ]
          }
        ]
      }
    ]
  };

  it('should find repeat group parent', () => {
    const result = getRepeatGroupParentItem(mockQuestionnaire, 'repeat-child');
    expect(result?.linkId).toBe('repeat-group');
    expect(result?.repeats).toBe(true);
  });

  it('should return null if no repeat group parent exists', () => {
    const result = getRepeatGroupParentItem(mockQuestionnaire, 'repeat-group');
    expect(result).toBeNull();
  });
});

describe('getSectionHeading', () => {
  const mockQuestionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    status: 'active',
    item: [
      {
        linkId: 'section-1',
        type: 'group',
        text: 'Section 1 Heading',
        item: [
          {
            linkId: 'item-1',
            type: 'string',
            text: 'Item 1'
          }
        ]
      }
    ]
  };

  const mockTabs = {
    'section-1': {
      linkId: 'section-1',
      title: 'Section 1',
      tabIndex: 0,
      isComplete: false,
      isHidden: false
    }
  };

  it('should find section heading for item', () => {
    const result = getSectionHeading(mockQuestionnaire, 'item-1', mockTabs);
    expect(result).toBe('Section 1 Heading');
  });

  it('should return null for item not found', () => {
    const result = getSectionHeading(mockQuestionnaire, 'non-existent', mockTabs);
    expect(result).toBeNull();
  });

  it('should handle questionnaire with no items', () => {
    const emptyQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active'
    };
    const result = getSectionHeading(emptyQuestionnaire, 'any-item', {});
    expect(result).toBeNull();
  });
});

describe('getSectionHeadingRecursive', () => {
  const mockQItem: QuestionnaireItem = {
    linkId: 'parent-group',
    type: 'group',
    text: 'Parent Group',
    item: [
      {
        linkId: 'target-item',
        type: 'string',
        text: 'Target Item'
      }
    ]
  };

  it('should find item and return heading', () => {
    const result = getSectionHeadingRecursive(mockQItem, 'target-item', 'Test Heading', {});
    expect(result).toBe('Test Heading');
  });

  it('should return null for non-existent item', () => {
    const result = getSectionHeadingRecursive(mockQItem, 'non-existent', 'Test Heading', {});
    expect(result).toBeNull();
  });

  it('should handle item with no children', () => {
    const leafItem: QuestionnaireItem = {
      linkId: 'leaf',
      type: 'string',
      text: 'Leaf Item'
    };
    const result = getSectionHeadingRecursive(leafItem, 'target-item', 'Test Heading', {});
    expect(result).toBeNull();
  });
});

describe('isItemInGrid', () => {
  const mockQuestionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    status: 'active',
    item: [
      {
        linkId: 'grid-group',
        type: 'group',
        text: 'Grid Group',
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
            valueCodeableConcept: {
              coding: [
                {
                  system: 'http://hl7.org/fhir/questionnaire-item-control',
                  code: 'grid'
                }
              ]
            }
          }
        ],
        item: [
          {
            linkId: 'grid-child',
            type: 'string',
            text: 'Item in Grid'
          }
        ]
      },
      {
        linkId: 'regular-item',
        type: 'string',
        text: 'Regular Item'
      }
    ]
  };

  it('should return true for item in grid', () => {
    const result = isItemInGrid(mockQuestionnaire, 'grid-child');
    expect(result).toBe(true);
  });

  it('should return false for item not in grid', () => {
    const result = isItemInGrid(mockQuestionnaire, 'regular-item');
    expect(result).toBe(false);
  });

  it('should return false for non-existent item', () => {
    const result = isItemInGrid(mockQuestionnaire, 'non-existent');
    expect(result).toBe(false);
  });
});

describe('getQuestionnaireResponseItemViaFhirPath', () => {
  const mockQuestionnaireResponse: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'completed',
    item: [
      {
        linkId: 'item-1',
        text: 'Item 1',
        answer: [{ valueString: 'test' }]
      }
    ]
  };

  it('should find item using FHIRPath expression', () => {
    const result = getQuestionnaireResponseItemViaFhirPath(
      mockQuestionnaireResponse,
      "item.where(linkId='item-1')"
    );
    expect(result).not.toBeNull();
    expect(result?.linkId).toBe('item-1');
  });

  it('should return null for non-matching FHIRPath', () => {
    const result = getQuestionnaireResponseItemViaFhirPath(
      mockQuestionnaireResponse,
      "item.where(linkId='non-existent')"
    );
    expect(result).toBeNull();
  });

  it('should handle invalid FHIRPath expression gracefully', () => {
    expect(() => {
      getQuestionnaireResponseItemViaFhirPath(
        mockQuestionnaireResponse,
        'invalid.fhirpath.expression'
      );
    }).not.toThrow();
  });
});
