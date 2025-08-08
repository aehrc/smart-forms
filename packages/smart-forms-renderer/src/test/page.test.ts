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
  getFirstVisiblePage,
  isPaginatedForm,
  isPageContainer,
  containsPages,
  isPage,
  isHeader,
  isFooter,
  constructPagesWithProperties,
  constructPagesWithVisibility
} from '../utils/page';
import type { Pages } from '../interfaces/page.interface';
import type { EnableWhenItems, EnableWhenExpressions } from '../interfaces/enableWhen.interface';
import type { QuestionnaireItem } from 'fhir/r4';

// Mock dependencies
jest.mock('../utils/extensions', () => ({
  isSpecificItemControl: jest.fn((item: QuestionnaireItem, controlType: string) => {
    const extensions = item.extension || [];
    return extensions.some(ext => 
      ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl' &&
      ext.valueCodeableConcept?.coding?.[0]?.code === controlType
    );
  })
}));

jest.mock('../utils/qItem', () => ({
  isHiddenByEnableWhen: jest.fn(({ linkId, enableWhenIsActivated, enableWhenItems, enableWhenExpressions }) => {
    if (!enableWhenIsActivated) return false;
    
    const singleItem = enableWhenItems.singleItems[linkId];
    if (singleItem) return !singleItem.isEnabled;
    
    const singleExpression = enableWhenExpressions.singleExpressions[linkId];
    if (singleExpression) return !singleExpression.isEnabled;
    
    return false;
  })
}));

jest.mock('fhir-sdc-helpers', () => ({
  structuredDataCapture: {
    getHidden: jest.fn((item: QuestionnaireItem) => {
      return item.extension?.find(ext => 
        ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden'
      )?.valueBoolean;
    })
  }
}));

describe('page utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockQuestionnaireItem = (linkId: string, controlType?: string, hidden?: boolean): QuestionnaireItem => ({
    linkId,
    type: 'group' as const,
    text: `${linkId} text`,
    ...(controlType && {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [{ code: controlType }]
          }
        },
        ...(hidden ? [{
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',
          valueBoolean: true
        }] : [])
      ]
    })
  });

  const createMockPages = (): Pages => ({
    'page-1': { pageIndex: 0, isComplete: false, isHidden: false },
    'page-2': { pageIndex: 1, isComplete: false, isHidden: true },
    'page-3': { pageIndex: 2, isComplete: true, isHidden: false }
  });

  const createMockEnableWhenItems = (): EnableWhenItems => ({
    singleItems: {
      'page-1': {
        linked: [],
        isEnabled: true
      },
      'page-2': {
        linked: [],
        isEnabled: false
      }
    },
    repeatItems: {}
  });

  const createMockEnableWhenExpressions = (): EnableWhenExpressions => ({
    singleExpressions: {
      'page-3': {
        expression: '%resource.item.where(linkId="trigger").answer.value = "yes"',
        isEnabled: true
      }
    },
    repeatExpressions: {}
  });

  describe('getFirstVisiblePage', () => {
    test('should return index of first visible page', () => {
      const pages = createMockPages();
      const enableWhenItems = createMockEnableWhenItems();
      const enableWhenExpressions = createMockEnableWhenExpressions();

      const result = getFirstVisiblePage(pages, enableWhenItems, enableWhenExpressions);

      expect(result).toBe(0); // page-1 is first visible (index 0)
    });

    test('should skip hidden pages', () => {
      const pages: Pages = {
        'page-1': { pageIndex: 0, isComplete: false, isHidden: true },
        'page-2': { pageIndex: 1, isComplete: false, isHidden: false }
      };
      const enableWhenItems: EnableWhenItems = { singleItems: {}, repeatItems: {} };
      const enableWhenExpressions: EnableWhenExpressions = { singleExpressions: {}, repeatExpressions: {} };

      const result = getFirstVisiblePage(pages, enableWhenItems, enableWhenExpressions);

      expect(result).toBe(1); // page-2 is first visible (index 1)
    });

    test('should skip pages disabled by enableWhen items', () => {
      const pages: Pages = {
        'page-1': { pageIndex: 0, isComplete: false, isHidden: false },
        'page-2': { pageIndex: 1, isComplete: false, isHidden: false }
      };
      const enableWhenItems: EnableWhenItems = {
        singleItems: {
          'page-1': { linked: [], isEnabled: false }
        },
        repeatItems: {}
      };
      const enableWhenExpressions: EnableWhenExpressions = { singleExpressions: {}, repeatExpressions: {} };

      const result = getFirstVisiblePage(pages, enableWhenItems, enableWhenExpressions);

      expect(result).toBe(1); // page-2 is first visible
    });

    test('should skip pages disabled by enableWhen expressions', () => {
      const pages: Pages = {
        'page-1': { pageIndex: 0, isComplete: false, isHidden: false },
        'page-2': { pageIndex: 1, isComplete: false, isHidden: false }
      };
      const enableWhenItems: EnableWhenItems = { singleItems: {}, repeatItems: {} };
      const enableWhenExpressions: EnableWhenExpressions = {
        singleExpressions: {
          'page-1': { expression: 'test-expression', isEnabled: false }
        },
        repeatExpressions: {}
      };

      const result = getFirstVisiblePage(pages, enableWhenItems, enableWhenExpressions);

      expect(result).toBe(1); // page-2 is first visible
    });

    test('should return pages sorted by pageIndex', () => {
      const pages: Pages = {
        'page-c': { pageIndex: 2, isComplete: false, isHidden: false },
        'page-a': { pageIndex: 0, isComplete: false, isHidden: false },
        'page-b': { pageIndex: 1, isComplete: false, isHidden: false }
      };
      const enableWhenItems: EnableWhenItems = { singleItems: {}, repeatItems: {} };
      const enableWhenExpressions: EnableWhenExpressions = { singleExpressions: {}, repeatExpressions: {} };

      const result = getFirstVisiblePage(pages, enableWhenItems, enableWhenExpressions);

      expect(result).toBe(0); // page-a should be first (lowest pageIndex)
    });

    test('should return -1 when no pages are visible', () => {
      const pages: Pages = {
        'page-1': { pageIndex: 0, isComplete: false, isHidden: true },
        'page-2': { pageIndex: 1, isComplete: false, isHidden: true }
      };
      const enableWhenItems: EnableWhenItems = { singleItems: {}, repeatItems: {} };
      const enableWhenExpressions: EnableWhenExpressions = { singleExpressions: {}, repeatExpressions: {} };

      const result = getFirstVisiblePage(pages, enableWhenItems, enableWhenExpressions);

      expect(result).toBe(-1);
    });

    test('should handle empty pages object', () => {
      const pages: Pages = {};
      const enableWhenItems: EnableWhenItems = { singleItems: {}, repeatItems: {} };
      const enableWhenExpressions: EnableWhenExpressions = { singleExpressions: {}, repeatExpressions: {} };

      const result = getFirstVisiblePage(pages, enableWhenItems, enableWhenExpressions);

      expect(result).toBe(-1);
    });

    test('should prioritize enableWhen items over expressions', () => {
      const pages: Pages = {
        'page-1': { pageIndex: 0, isComplete: false, isHidden: false }
      };
      const enableWhenItems: EnableWhenItems = {
        singleItems: {
          'page-1': { linked: [], isEnabled: false }
        },
        repeatItems: {}
      };
      const enableWhenExpressions: EnableWhenExpressions = {
        singleExpressions: {
          'page-1': { expression: 'test-expression', isEnabled: true }
        },
        repeatExpressions: {}
      };

      const result = getFirstVisiblePage(pages, enableWhenItems, enableWhenExpressions);

      expect(result).toBe(-1); // enableWhen item takes precedence
    });
  });

  describe('isPaginatedForm', () => {
    test('should return true when all items are page, header, or footer', () => {
      const items = [
        createMockQuestionnaireItem('page-1', 'page'),
        createMockQuestionnaireItem('header-1', 'header'),
        createMockQuestionnaireItem('footer-1', 'footer')
      ];

      const result = isPaginatedForm(items);

      expect(result).toBe(true);
    });

    test('should return false when any item is not page, header, or footer', () => {
      const items = [
        createMockQuestionnaireItem('page-1', 'page'),
        createMockQuestionnaireItem('group-1') // no control type
      ];

      const result = isPaginatedForm(items);

      expect(result).toBe(false);
    });

    test('should return false for undefined items', () => {
      const result = isPaginatedForm(undefined);

      expect(result).toBe(false);
    });

    test('should return true for empty array', () => {
      const result = isPaginatedForm([]);

      expect(result).toBe(true);
    });

    test('should handle items with different control types', () => {
      const items = [
        createMockQuestionnaireItem('page-1', 'page'),
        createMockQuestionnaireItem('table-1', 'table') // different control type
      ];

      const result = isPaginatedForm(items);

      expect(result).toBe(false);
    });
  });

  describe('isPageContainer', () => {
    test('should return true when page item contains group children', () => {
      const items = [
        {
          ...createMockQuestionnaireItem('page-1', 'page'),
          item: [
            { linkId: 'group-1', type: 'group' as const },
            { linkId: 'group-2', type: 'group' as const }
          ]
        }
      ];

      const result = isPageContainer(items);

      expect(result).toBe(true);
    });

    test('should return false when page item contains non-group children', () => {
      const items = [
        {
          ...createMockQuestionnaireItem('page-1', 'page'),
          item: [
            { linkId: 'group-1', type: 'group' as const },
            { linkId: 'string-1', type: 'string' as const }
          ]
        }
      ];

      const result = isPageContainer(items);

      expect(result).toBe(false);
    });

    test('should return false when no page items exist', () => {
      const items = [
        createMockQuestionnaireItem('group-1')
      ];

      const result = isPageContainer(items);

      expect(result).toBe(false);
    });

    test('should return false for undefined items', () => {
      const result = isPageContainer(undefined);

      expect(result).toBe(false);
    });

    test('should return false when page item has no children', () => {
      const items = [
        createMockQuestionnaireItem('page-1', 'page')
      ];

      const result = isPageContainer(items);

      expect(result).toBe(false);
    });

    test('should return true when page item has empty children array', () => {
      const items = [
        {
          ...createMockQuestionnaireItem('page-1', 'page'),
          item: []
        }
      ];

      const result = isPageContainer(items);

      expect(result).toBe(true); // empty.every() returns true (vacuous truth)
    });
  });

  describe('containsPages', () => {
    test('should return true when questionnaire item contains page items', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'container',
        type: 'group',
        item: [
          createMockQuestionnaireItem('page-1', 'page'),
          createMockQuestionnaireItem('group-1')
        ]
      };

      const result = containsPages(qItem);

      expect(result).toBe(true);
    });

    test('should return false when no page items exist', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'container',
        type: 'group',
        item: [
          createMockQuestionnaireItem('group-1'),
          createMockQuestionnaireItem('string-1')
        ]
      };

      const result = containsPages(qItem);

      expect(result).toBe(false);
    });

    test('should return false when item has no children', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'container',
        type: 'group'
      };

      const result = containsPages(qItem);

      expect(result).toBe(false);
    });

    test('should return false when item has empty children array', () => {
      const qItem: QuestionnaireItem = {
        linkId: 'container',
        type: 'group',
        item: []
      };

      const result = containsPages(qItem);

      expect(result).toBe(false);
    });
  });

  describe('isPage', () => {
    test('should return true for item with page control', () => {
      const item = createMockQuestionnaireItem('page-1', 'page');

      const result = isPage(item);

      expect(result).toBe(true);
    });

    test('should return false for item without page control', () => {
      const item = createMockQuestionnaireItem('group-1');

      const result = isPage(item);

      expect(result).toBe(false);
    });

    test('should return false for item with different control type', () => {
      const item = createMockQuestionnaireItem('header-1', 'header');

      const result = isPage(item);

      expect(result).toBe(false);
    });
  });

  describe('isHeader', () => {
    test('should return true for item with header control', () => {
      const item = createMockQuestionnaireItem('header-1', 'header');

      const result = isHeader(item);

      expect(result).toBe(true);
    });

    test('should return false for item without header control', () => {
      const item = createMockQuestionnaireItem('group-1');

      const result = isHeader(item);

      expect(result).toBe(false);
    });

    test('should return false for item with different control type', () => {
      const item = createMockQuestionnaireItem('page-1', 'page');

      const result = isHeader(item);

      expect(result).toBe(false);
    });
  });

  describe('isFooter', () => {
    test('should return true for item with footer control', () => {
      const item = createMockQuestionnaireItem('footer-1', 'footer');

      const result = isFooter(item);

      expect(result).toBe(true);
    });

    test('should return false for item without footer control', () => {
      const item = createMockQuestionnaireItem('group-1');

      const result = isFooter(item);

      expect(result).toBe(false);
    });

    test('should return false for item with different control type', () => {
      const item = createMockQuestionnaireItem('page-1', 'page');

      const result = isFooter(item);

      expect(result).toBe(false);
    });
  });

  describe('constructPagesWithProperties', () => {
    test('should create pages object for page items', () => {
      const items = [
        createMockQuestionnaireItem('page-1', 'page'),
        createMockQuestionnaireItem('group-1'), // not a page
        createMockQuestionnaireItem('page-2', 'page')
      ];

      const result = constructPagesWithProperties(items, false);

      expect(result).toEqual({
        'page-1': { pageIndex: 0, isComplete: false, isHidden: false },
        'page-2': { pageIndex: 2, isComplete: false, isHidden: false }
      });
    });

    test('should create pages for all items when allChildItemsArePages is true', () => {
      const items = [
        createMockQuestionnaireItem('item-1'),
        createMockQuestionnaireItem('item-2')
      ];

      const result = constructPagesWithProperties(items, true);

      expect(result).toEqual({
        'item-1': { pageIndex: 0, isComplete: false, isHidden: false },
        'item-2': { pageIndex: 1, isComplete: false, isHidden: false }
      });
    });

    test('should handle hidden pages correctly', () => {
      const items = [
        createMockQuestionnaireItem('page-1', 'page', true), // hidden
        createMockQuestionnaireItem('page-2', 'page')
      ];

      const result = constructPagesWithProperties(items, false);

      expect(result).toEqual({
        'page-1': { pageIndex: 0, isComplete: false, isHidden: true },
        'page-2': { pageIndex: 1, isComplete: false, isHidden: false }
      });
    });

    test('should return empty object for undefined items', () => {
      const result = constructPagesWithProperties(undefined, false);

      expect(result).toEqual({});
    });

    test('should return empty object for empty items array', () => {
      const result = constructPagesWithProperties([], false);

      expect(result).toEqual({});
    });

    test('should handle items without extensions', () => {
      const items = [
        { linkId: 'item-1', type: 'group' as const, text: 'Item 1' }
      ];

      const result = constructPagesWithProperties(items, true);

      expect(result).toEqual({
        'item-1': { pageIndex: 0, isComplete: false, isHidden: false }
      });
    });
  });

  describe('constructPagesWithVisibility', () => {
    test('should create visibility info for pages', () => {
      const pages: Pages = {
        'page-1': { pageIndex: 0, isComplete: false, isHidden: false },
        'page-2': { pageIndex: 1, isComplete: false, isHidden: false }
      };

      const params = {
        pages,
        enableWhenIsActivated: true,
        enableWhenItems: {
          singleItems: {
            'page-1': { linked: [], isEnabled: true }
          },
          repeatItems: {}
        },
        enableWhenExpressions: {
          singleExpressions: {
            'page-2': { expression: 'test', isEnabled: false }
          },
          repeatExpressions: {}
        }
      };

      const result = constructPagesWithVisibility(params);

      expect(result).toEqual([
        { linkId: 'page-1', isVisible: true },
        { linkId: 'page-2', isVisible: false }
      ]);
    });

    test('should show all pages when enableWhen is not activated', () => {
      const pages: Pages = {
        'page-1': { pageIndex: 0, isComplete: false, isHidden: false },
        'page-2': { pageIndex: 1, isComplete: false, isHidden: false }
      };

      const params = {
        pages,
        enableWhenIsActivated: false,
        enableWhenItems: {
          singleItems: {
            'page-1': { linked: [], isEnabled: false }
          },
          repeatItems: {}
        },
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} }
      };

      const result = constructPagesWithVisibility(params);

      expect(result).toEqual([
        { linkId: 'page-1', isVisible: true },
        { linkId: 'page-2', isVisible: true }
      ]);
    });

    test('should handle empty pages object', () => {
      const params = {
        pages: {},
        enableWhenIsActivated: true,
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} }
      };

      const result = constructPagesWithVisibility(params);

      expect(result).toEqual([]);
    });

    test('should handle pages without enableWhen conditions', () => {
      const pages: Pages = {
        'page-1': { pageIndex: 0, isComplete: false, isHidden: false },
        'page-2': { pageIndex: 1, isComplete: false, isHidden: false }
      };

      const params = {
        pages,
        enableWhenIsActivated: true,
        enableWhenItems: { singleItems: {}, repeatItems: {} },
        enableWhenExpressions: { singleExpressions: {}, repeatExpressions: {} }
      };

      const result = constructPagesWithVisibility(params);

      expect(result).toEqual([
        { linkId: 'page-1', isVisible: true },
        { linkId: 'page-2', isVisible: true }
      ]);
    });
  });
});
