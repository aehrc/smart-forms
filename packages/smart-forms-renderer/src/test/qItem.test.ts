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

import { describe, expect, test, jest } from '@jest/globals';
import {
  isHiddenByEnableWhen,
  isRepeatItemAndNotCheckbox,
  isCheckbox,
  getXHtmlStringFromQuestionnaire,
  getLinkIdPartialItemMap,
  getLinkIdPartialTuplesFromItemRecursive,
  getLinkIdPreferredTerminologyServerTuples,
  getGroupCollapsible,
  isItemHidden,
  type CollapsibleType
} from '../utils/qItem';
import type { 
  Questionnaire, 
  QuestionnaireItem 
} from 'fhir/r4';
import type { EnableWhenExpressions, EnableWhenItems } from '../interfaces/enableWhen.interface';

// Mock dependencies
jest.mock('../utils/choice', () => ({
  getChoiceControlType: jest.fn()
}));

jest.mock('../utils/openChoice', () => ({
  getOpenChoiceControlType: jest.fn()
}));

jest.mock('fhir-sdc-helpers', () => ({
  structuredDataCapture: {
    getHidden: jest.fn()
  }
}));

// Import mocked functions
import { getChoiceControlType } from '../utils/choice';
import { getOpenChoiceControlType } from '../utils/openChoice';
import { structuredDataCapture } from 'fhir-sdc-helpers';
import { ChoiceItemControl, OpenChoiceItemControl } from '../interfaces/choice.enum';

const mockGetChoiceControlType = getChoiceControlType as jest.MockedFunction<typeof getChoiceControlType>;
const mockGetOpenChoiceControlType = getOpenChoiceControlType as jest.MockedFunction<typeof getOpenChoiceControlType>;
const mockGetHidden = structuredDataCapture.getHidden as jest.MockedFunction<typeof structuredDataCapture.getHidden>;

// Helper function to create a basic QuestionnaireItem
function createMockQuestionnaireItem(linkId: string, type: QuestionnaireItem['type'] = 'string'): QuestionnaireItem {
  return {
    linkId,
    text: `${linkId} item`,
    type
  };
}

describe('qItem utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isHiddenByEnableWhen', () => {
    const mockEnableWhenItems: EnableWhenItems = {
      singleItems: {
        'enabled-item': { 
          isEnabled: true,
          linked: []
        },
        'disabled-item': { 
          isEnabled: false,
          linked: []
        }
      },
      repeatItems: {
        'repeat-item': { 
          enabledIndexes: [true, false, true],
          linked: [],
          parentLinkId: 'parent'
        }
      }
    };

    const mockEnableWhenExpressions: EnableWhenExpressions = {
      singleExpressions: {
        'expr-enabled': { 
          expression: '%context.test = true',
          isEnabled: true 
        },
        'expr-disabled': { 
          expression: '%context.test = false',
          isEnabled: false 
        }
      },
      repeatExpressions: {
        'repeat-expr': { 
          expression: '%context.repeat = true',
          parentLinkId: 'parent',
          enabledIndexes: [false, true, false] 
        }
      }
    };

    test('should return false when enableWhen is not activated', () => {
      const result = isHiddenByEnableWhen({
        linkId: 'disabled-item',
        enableWhenIsActivated: false,
        enableWhenItems: mockEnableWhenItems,
        enableWhenExpressions: mockEnableWhenExpressions
      });

      expect(result).toBe(false);
    });

    test('should return true for disabled single items', () => {
      const result = isHiddenByEnableWhen({
        linkId: 'disabled-item',
        enableWhenIsActivated: true,
        enableWhenItems: mockEnableWhenItems,
        enableWhenExpressions: mockEnableWhenExpressions
      });

      expect(result).toBe(true);
    });

    test('should return false for enabled single items', () => {
      const result = isHiddenByEnableWhen({
        linkId: 'enabled-item',
        enableWhenIsActivated: true,
        enableWhenItems: mockEnableWhenItems,
        enableWhenExpressions: mockEnableWhenExpressions
      });

      expect(result).toBe(false);
    });

    test('should return true for disabled repeat items at specific index', () => {
      const result = isHiddenByEnableWhen({
        linkId: 'repeat-item',
        enableWhenIsActivated: true,
        enableWhenItems: mockEnableWhenItems,
        enableWhenExpressions: mockEnableWhenExpressions,
        parentRepeatGroupIndex: 1
      });

      expect(result).toBe(true);
    });

    test('should return false for enabled repeat items at specific index', () => {
      const result = isHiddenByEnableWhen({
        linkId: 'repeat-item',
        enableWhenIsActivated: true,
        enableWhenItems: mockEnableWhenItems,
        enableWhenExpressions: mockEnableWhenExpressions,
        parentRepeatGroupIndex: 0
      });

      expect(result).toBe(false);
    });

    test('should check enableWhen expressions for single items', () => {
      const result = isHiddenByEnableWhen({
        linkId: 'expr-disabled',
        enableWhenIsActivated: true,
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        enableWhenExpressions: mockEnableWhenExpressions
      });

      expect(result).toBe(true);
    });

    test('should check enableWhen expressions for repeat items', () => {
      const result = isHiddenByEnableWhen({
        linkId: 'repeat-expr',
        enableWhenIsActivated: true,
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        enableWhenExpressions: mockEnableWhenExpressions,
        parentRepeatGroupIndex: 0
      });

      expect(result).toBe(true);
    });

    test('should return false for unknown linkId', () => {
      const result = isHiddenByEnableWhen({
        linkId: 'unknown-item',
        enableWhenIsActivated: true,
        enableWhenItems: mockEnableWhenItems,
        enableWhenExpressions: mockEnableWhenExpressions
      });

      expect(result).toBe(false);
    });

    test('should ignore repeat items when parentRepeatGroupIndex is undefined', () => {
      const result = isHiddenByEnableWhen({
        linkId: 'repeat-item',
        enableWhenIsActivated: true,
        enableWhenItems: mockEnableWhenItems,
        enableWhenExpressions: mockEnableWhenExpressions
        // parentRepeatGroupIndex not provided
      });

      expect(result).toBe(false);
    });
  });

  describe('isRepeatItemAndNotCheckbox', () => {
    test('should return false for null/undefined qItem', () => {
      expect(isRepeatItemAndNotCheckbox(null as any)).toBe(false);
      expect(isRepeatItemAndNotCheckbox(undefined as any)).toBe(false);
    });

    test('should return false for non-repeating items', () => {
      const qItem = createMockQuestionnaireItem('test', 'string');
      qItem.repeats = false;

      mockGetChoiceControlType.mockReturnValue(ChoiceItemControl.Select);
      mockGetOpenChoiceControlType.mockReturnValue(OpenChoiceItemControl.Select);

      const result = isRepeatItemAndNotCheckbox(qItem);

      expect(result).toBe(false);
    });

    test('should return true for repeating non-checkbox items', () => {
      const qItem = createMockQuestionnaireItem('test', 'string');
      qItem.repeats = true;

      mockGetChoiceControlType.mockReturnValue(ChoiceItemControl.Select);
      mockGetOpenChoiceControlType.mockReturnValue(OpenChoiceItemControl.Select);

      const result = isRepeatItemAndNotCheckbox(qItem);

      expect(result).toBe(true);
    });

    test('should return false for repeating checkbox items (choice)', () => {
      const qItem = createMockQuestionnaireItem('test', 'choice');
      qItem.repeats = true;

      mockGetChoiceControlType.mockReturnValue(ChoiceItemControl.Checkbox);
      mockGetOpenChoiceControlType.mockReturnValue(OpenChoiceItemControl.Select);

      const result = isRepeatItemAndNotCheckbox(qItem);

      expect(result).toBe(false);
    });

    test('should return false for repeating checkbox items (open-choice)', () => {
      const qItem = createMockQuestionnaireItem('test', 'open-choice');
      qItem.repeats = true;

      mockGetChoiceControlType.mockReturnValue(ChoiceItemControl.Select);
      mockGetOpenChoiceControlType.mockReturnValue(OpenChoiceItemControl.Checkbox);

      const result = isRepeatItemAndNotCheckbox(qItem);

      expect(result).toBe(false);
    });

    test('should handle missing repeats property', () => {
      const qItem = createMockQuestionnaireItem('test', 'string');
      // repeats property not set

      mockGetChoiceControlType.mockReturnValue(ChoiceItemControl.Select);
      mockGetOpenChoiceControlType.mockReturnValue(OpenChoiceItemControl.Select);

      const result = isRepeatItemAndNotCheckbox(qItem);

      expect(result).toBe(false);
    });
  });

  describe('isCheckbox', () => {
    test('should return false for null/undefined qItem', () => {
      expect(isCheckbox(null as any)).toBe(false);
      expect(isCheckbox(undefined as any)).toBe(false);
    });

    test('should return true for checkbox choice items', () => {
      const qItem = createMockQuestionnaireItem('test', 'choice');

      mockGetChoiceControlType.mockReturnValue(ChoiceItemControl.Checkbox);

      const result = isCheckbox(qItem);

      expect(result).toBe(true);
    });

    test('should return false for non-checkbox choice items', () => {
      const qItem = createMockQuestionnaireItem('test', 'choice');

      mockGetChoiceControlType.mockReturnValue(ChoiceItemControl.Select);

      const result = isCheckbox(qItem);

      expect(result).toBe(false);
    });

    test('should return false for string items', () => {
      const qItem = createMockQuestionnaireItem('test', 'string');

      mockGetChoiceControlType.mockReturnValue(ChoiceItemControl.Select);

      const result = isCheckbox(qItem);

      expect(result).toBe(false);
    });
  });

  describe('getXHtmlStringFromQuestionnaire', () => {
    test('should return XHTML string when extension is present', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        title: 'Test Questionnaire',
        _title: {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
              valueString: '<div><b>Rich Text Title</b></div>'
            }
          ]
        }
      };

      const result = getXHtmlStringFromQuestionnaire(questionnaire);

      expect(result).toBe('<div><b>Rich Text Title</b></div>');
    });

    test('should return null when extension has no valueString', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        title: 'Test Questionnaire',
        _title: {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml'
              // no valueString
            }
          ]
        }
      };

      const result = getXHtmlStringFromQuestionnaire(questionnaire);

      expect(result).toBe(null);
    });

    test('should return null when no XHTML extension is present', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        title: 'Test Questionnaire',
        _title: {
          extension: [
            {
              url: 'http://different.extension.url',
              valueString: 'Different extension'
            }
          ]
        }
      };

      const result = getXHtmlStringFromQuestionnaire(questionnaire);

      expect(result).toBe(null);
    });

    test('should return null when _title is missing', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        title: 'Test Questionnaire'
      };

      const result = getXHtmlStringFromQuestionnaire(questionnaire);

      expect(result).toBe(null);
    });

    test('should return null when _title.extension is missing', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        title: 'Test Questionnaire',
        _title: {}
      };

      const result = getXHtmlStringFromQuestionnaire(questionnaire);

      expect(result).toBe(null);
    });
  });

  describe('getLinkIdPartialItemMap', () => {
    test('should return empty object for questionnaire with no items', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active'
      };

      const result = getLinkIdPartialItemMap(questionnaire);

      expect(result).toEqual({});
    });

    test('should return empty object for questionnaire with empty items array', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: []
      };

      const result = getLinkIdPartialItemMap(questionnaire);

      expect(result).toEqual({});
    });

    test('should create map for single item', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'item1',
            text: 'Item 1',
            type: 'string'
          }
        ]
      };

      const result = getLinkIdPartialItemMap(questionnaire);

      expect(result).toEqual({
        'item1': {
          linkId: 'item1',
          text: 'Item 1',
          type: 'string'
        }
      });
    });

    test('should create map for nested items', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'group1',
            text: 'Group 1',
            type: 'group',
            item: [
              {
                linkId: 'item1',
                text: 'Item 1',
                type: 'string'
              },
              {
                linkId: 'item2',
                text: 'Item 2',
                type: 'integer'
              }
            ]
          }
        ]
      };

      const result = getLinkIdPartialItemMap(questionnaire);

      expect(result).toEqual({
        'group1': {
          linkId: 'group1',
          text: 'Group 1',
          type: 'group'
        },
        'item1': {
          linkId: 'item1',
          text: 'Item 1',
          type: 'string'
        },
        'item2': {
          linkId: 'item2',
          text: 'Item 2',
          type: 'integer'
        }
      });
    });

    test('should handle deeply nested items', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'group1',
            text: 'Group 1',
            type: 'group',
            item: [
              {
                linkId: 'group2',
                text: 'Group 2',
                type: 'group',
                item: [
                  {
                    linkId: 'item1',
                    text: 'Item 1',
                    type: 'string'
                  }
                ]
              }
            ]
          }
        ]
      };

      const result = getLinkIdPartialItemMap(questionnaire);

      expect(result).toEqual({
        'group1': {
          linkId: 'group1',
          text: 'Group 1',
          type: 'group'
        },
        'group2': {
          linkId: 'group2',
          text: 'Group 2',
          type: 'group'
        },
        'item1': {
          linkId: 'item1',
          text: 'Item 1',
          type: 'string'
        }
      });
    });
  });

  describe('getLinkIdPartialTuplesFromItemRecursive', () => {
    test('should return single tuple for item without children', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'item1',
        text: 'Item 1',
        type: 'string'
      };

      const result = getLinkIdPartialTuplesFromItemRecursive(qItem);

      expect(result).toEqual([
        ['item1', { linkId: 'item1', text: 'Item 1', type: 'string' }]
      ]);
    });

    test('should return tuples for item with children', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'group1',
        text: 'Group 1',
        type: 'group',
        item: [
          {
            linkId: 'item1',
            text: 'Item 1',
            type: 'string'
          },
          {
            linkId: 'item2',
            text: 'Item 2',
            type: 'integer'
          }
        ]
      };

      const result = getLinkIdPartialTuplesFromItemRecursive(qItem);

      expect(result).toEqual([
        ['group1', { linkId: 'group1', text: 'Group 1', type: 'group' }],
        ['item1', { linkId: 'item1', text: 'Item 1', type: 'string' }],
        ['item2', { linkId: 'item2', text: 'Item 2', type: 'integer' }]
      ]);
    });

    test('should handle item without linkId', () => {
      const qItem: QuestionnaireItem = {
        text: 'Item without linkId',
        type: 'string'
      } as any; // Cast to bypass TypeScript validation for test

      const result = getLinkIdPartialTuplesFromItemRecursive(qItem);

      expect(result).toEqual([]);
    });

    test('should exclude item property from partial objects', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'group1',
        text: 'Group 1',
        type: 'group',
        required: true,
        maxLength: 100,
        item: [
          {
            linkId: 'child1',
            text: 'Child 1',
            type: 'string'
          }
        ]
      };

      const result = getLinkIdPartialTuplesFromItemRecursive(qItem);

      expect(result[0][1]).toEqual({
        linkId: 'group1',
        text: 'Group 1',
        type: 'group',
        required: true,
        maxLength: 100
        // item property should be excluded
      });
      expect(result[0][1]).not.toHaveProperty('item');
    });
  });

  describe('getLinkIdPreferredTerminologyServerTuples', () => {
    test('should return empty array for questionnaire with no items', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active'
      };

      const result = getLinkIdPreferredTerminologyServerTuples(questionnaire);

      expect(result).toEqual([]);
    });

    test('should return empty array for items without terminology server extensions', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'item1',
            text: 'Item 1',
            type: 'string'
          }
        ]
      };

      const result = getLinkIdPreferredTerminologyServerTuples(questionnaire);

      expect(result).toEqual([]);
    });

    test('should return tuples for items with terminology server extension', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'item1',
            text: 'Item 1',
            type: 'choice',
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-preferredTerminologyServer',
                valueUrl: 'https://terminology.server.com'
              }
            ]
          }
        ]
      };

      const result = getLinkIdPreferredTerminologyServerTuples(questionnaire);

      expect(result).toEqual([
        ['item1', 'https://terminology.server.com']
      ]);
    });

    test('should inherit terminology server from questionnaire level', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-preferredTerminologyServer',
            valueUrl: 'https://global.terminology.com'
          }
        ],
        item: [
          {
            linkId: 'item1',
            text: 'Item 1',
            type: 'choice'
          }
        ]
      };

      const result = getLinkIdPreferredTerminologyServerTuples(questionnaire);

      expect(result).toEqual([
        ['item1', 'https://global.terminology.com']
      ]);
    });

    test('should override parent terminology server with item-specific one', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-preferredTerminologyServer',
            valueUrl: 'https://global.terminology.com'
          }
        ],
        item: [
          {
            linkId: 'item1',
            text: 'Item 1',
            type: 'choice',
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-preferredTerminologyServer',
                valueUrl: 'https://specific.terminology.com'
              }
            ]
          }
        ]
      };

      const result = getLinkIdPreferredTerminologyServerTuples(questionnaire);

      expect(result).toEqual([
        ['item1', 'https://specific.terminology.com']
      ]);
    });

    test('should handle valueUri and valueString alternatives', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'item1',
            text: 'Item 1',
            type: 'choice',
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-preferredTerminologyServer',
                valueUri: 'https://uri.terminology.com'
              }
            ]
          },
          {
            linkId: 'item2',
            text: 'Item 2',
            type: 'choice',
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-preferredTerminologyServer',
                valueString: 'https://string.terminology.com'
              }
            ]
          }
        ]
      };

      const result = getLinkIdPreferredTerminologyServerTuples(questionnaire);

      expect(result).toEqual([
        ['item1', 'https://uri.terminology.com'],
        ['item2', 'https://string.terminology.com']
      ]);
    });

    test('should handle nested items with inherited terminology servers', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-preferredTerminologyServer',
            valueUrl: 'https://global.terminology.com'
          }
        ],
        item: [
          {
            linkId: 'group1',
            text: 'Group 1',
            type: 'group',
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-preferredTerminologyServer',
                valueUrl: 'https://group.terminology.com'
              }
            ],
            item: [
              {
                linkId: 'item1',
                text: 'Item 1',
                type: 'choice'
              },
              {
                linkId: 'item2',
                text: 'Item 2',
                type: 'choice',
                extension: [
                  {
                    url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-preferredTerminologyServer',
                    valueUrl: 'https://specific.terminology.com'
                  }
                ]
              }
            ]
          }
        ]
      };

      const result = getLinkIdPreferredTerminologyServerTuples(questionnaire);

      expect(result).toEqual([
        ['group1', 'https://group.terminology.com'],
        ['item1', 'https://group.terminology.com'],
        ['item2', 'https://specific.terminology.com']
      ]);
    });
  });

  describe('getGroupCollapsible', () => {
    test('should return null when no extensions are present', () => {
      const qItem = createMockQuestionnaireItem('group1', 'group');

      const result = getGroupCollapsible(qItem);

      expect(result).toBe(null);
    });

    test('should return null when collapsible extension is not present', () => {
      const qItem = createMockQuestionnaireItem('group1', 'group');
      qItem.extension = [
        {
          url: 'http://different.extension.url',
          valueCode: 'default-open'
        }
      ];

      const result = getGroupCollapsible(qItem);

      expect(result).toBe(null);
    });

    test('should return default-open when extension has valid valueCode', () => {
      const qItem = createMockQuestionnaireItem('group1', 'group');
      qItem.extension = [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-collapsible',
          valueCode: 'default-open'
        }
      ];

      const result = getGroupCollapsible(qItem);

      expect(result).toBe('default-open');
    });

    test('should return default-closed when extension has valid valueCode', () => {
      const qItem = createMockQuestionnaireItem('group1', 'group');
      qItem.extension = [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-collapsible',
          valueCode: 'default-closed'
        }
      ];

      const result = getGroupCollapsible(qItem);

      expect(result).toBe('default-closed');
    });

    test('should return null when extension has invalid valueCode', () => {
      const qItem = createMockQuestionnaireItem('group1', 'group');
      qItem.extension = [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-collapsible',
          valueCode: 'invalid-value'
        }
      ];

      const result = getGroupCollapsible(qItem);

      expect(result).toBe(null);
    });

    test('should return null when extension has no valueCode', () => {
      const qItem = createMockQuestionnaireItem('group1', 'group');
      qItem.extension = [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-collapsible'
          // no valueCode
        }
      ];

      const result = getGroupCollapsible(qItem);

      expect(result).toBe(null);
    });

    test('should return first valid collapsible extension when multiple exist', () => {
      const qItem = createMockQuestionnaireItem('group1', 'group');
      qItem.extension = [
        {
          url: 'http://different.extension.url',
          valueCode: 'default-open'
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-collapsible',
          valueCode: 'default-closed'
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-collapsible',
          valueCode: 'default-open'
        }
      ];

      const result = getGroupCollapsible(qItem);

      expect(result).toBe('default-closed');
    });
  });

  describe('isItemHidden', () => {
    const mockEnableWhenItems: EnableWhenItems = {
      singleItems: {
        'disabled-item': { 
          isEnabled: false,
          linked: []
        }
      },
      repeatItems: {}
    };

    const mockEnableWhenExpressions: EnableWhenExpressions = {
      singleExpressions: {},
      repeatExpressions: {}
    };

    test('should return true when item has hidden property set to true', () => {
      const qItem = createMockQuestionnaireItem('test', 'string');
      
      mockGetHidden.mockReturnValue(true);

      const result = isItemHidden(
        qItem,
        true,
        mockEnableWhenItems,
        mockEnableWhenExpressions,
        false
      );

      expect(result).toBe(true);
      expect(mockGetHidden).toHaveBeenCalledWith(qItem);
    });

    test('should return false when item is not hidden and enableWhenAsReadOnly is true', () => {
      const qItem = createMockQuestionnaireItem('disabled-item', 'string');
      
      mockGetHidden.mockReturnValue(false);

      const result = isItemHidden(
        qItem,
        true,
        mockEnableWhenItems,
        mockEnableWhenExpressions,
        true // enableWhenAsReadOnly
      );

      expect(result).toBe(false);
    });

    test('should return false when item type is in enableWhenAsReadOnly Set', () => {
      const qItem = createMockQuestionnaireItem('disabled-item', 'string');
      
      mockGetHidden.mockReturnValue(false);

      const enableWhenAsReadOnlySet = new Set<QuestionnaireItem['type']>(['string', 'integer']);

      const result = isItemHidden(
        qItem,
        true,
        mockEnableWhenItems,
        mockEnableWhenExpressions,
        enableWhenAsReadOnlySet
      );

      expect(result).toBe(false);
    });

    test('should check enableWhen when enableWhenAsReadOnly is false', () => {
      const qItem = createMockQuestionnaireItem('disabled-item', 'string');
      
      mockGetHidden.mockReturnValue(false);

      const result = isItemHidden(
        qItem,
        true,
        mockEnableWhenItems,
        mockEnableWhenExpressions,
        false
      );

      expect(result).toBe(true);
    });

    test('should return false when enableWhen is not activated', () => {
      const qItem = createMockQuestionnaireItem('disabled-item', 'string');
      
      mockGetHidden.mockReturnValue(false);

      const result = isItemHidden(
        qItem,
        false, // enableWhenIsActivated
        mockEnableWhenItems,
        mockEnableWhenExpressions,
        false
      );

      expect(result).toBe(false);
    });

    test('should handle parentRepeatGroupIndex parameter', () => {
      const qItem = createMockQuestionnaireItem('test', 'string');
      
      mockGetHidden.mockReturnValue(false);

      const result = isItemHidden(
        qItem,
        true,
        mockEnableWhenItems,
        mockEnableWhenExpressions,
        false,
        2 // parentRepeatGroupIndex
      );

      expect(result).toBe(false);
    });

    test('should return false when item type is not in enableWhenAsReadOnly Set', () => {
      const qItem = createMockQuestionnaireItem('disabled-item', 'boolean');
      
      mockGetHidden.mockReturnValue(false);

      const enableWhenAsReadOnlySet = new Set<QuestionnaireItem['type']>(['string', 'integer']);

      const result = isItemHidden(
        qItem,
        true,
        mockEnableWhenItems,
        mockEnableWhenExpressions,
        enableWhenAsReadOnlySet
      );

      expect(result).toBe(true); // Should check enableWhen since boolean is not in the set
    });
  });

  describe('Edge cases and error handling', () => {
    test('should handle empty extension arrays gracefully', () => {
      const qItem = createMockQuestionnaireItem('test', 'group');
      qItem.extension = [];

      expect(getGroupCollapsible(qItem)).toBe(null);
    });

    test('should handle questionnaire with empty extension array', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        extension: [],
        item: [
          {
            linkId: 'item1',
            text: 'Item 1',
            type: 'choice'
          }
        ]
      };

      const result = getLinkIdPreferredTerminologyServerTuples(questionnaire);

      expect(result).toEqual([]);
    });

    test('should handle items with complex extension structures', () => {
      const qItem = createMockQuestionnaireItem('test', 'group');
      qItem.extension = [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-collapsible',
          extension: [
            {
              url: 'nested',
              valueCode: 'default-open'
            }
          ]
        }
      ];

      // Should return null because valueCode is in nested extension, not at top level
      expect(getGroupCollapsible(qItem)).toBe(null);
    });

    test('should handle enableWhen items with missing properties', () => {
      const mockIncompleteEnableWhenItems: EnableWhenItems = {
        singleItems: {},
        repeatItems: {
          'incomplete-repeat': { 
            enabledIndexes: [],
            linked: [],
            parentLinkId: 'parent'
          }
        }
      };

      const result = isHiddenByEnableWhen({
        linkId: 'incomplete-repeat',
        enableWhenIsActivated: true,
        enableWhenItems: mockIncompleteEnableWhenItems,
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} },
        parentRepeatGroupIndex: 0
      });

      // Should handle gracefully when enabledIndexes is empty or undefined for the index
      expect(result).toBe(true); // undefined is falsy
    });
  });
});
