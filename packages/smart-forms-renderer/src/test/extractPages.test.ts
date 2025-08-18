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

import type { Questionnaire } from 'fhir/r4';
import { extractPages } from '../utils/questionnaireStoreUtils/extractPages';

// Mock the page utility functions
jest.mock('../utils/page', () => ({
  constructPagesWithProperties: jest.fn(),
  isFooter: jest.fn(),
  isHeader: jest.fn(),
  isPage: jest.fn()
}));

import { constructPagesWithProperties, isFooter, isHeader, isPage } from '../utils/page';

const mockConstructPagesWithProperties = constructPagesWithProperties as jest.MockedFunction<typeof constructPagesWithProperties>;
const mockIsFooter = isFooter as jest.MockedFunction<typeof isFooter>;
const mockIsHeader = isHeader as jest.MockedFunction<typeof isHeader>;
const mockIsPage = isPage as jest.MockedFunction<typeof isPage>;

describe('extractPages - Phase 5', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractPages', () => {
    it('should return empty object when questionnaire has no items', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active'
      };

      const result = extractPages(questionnaire);

      expect(result).toEqual({});
      expect(mockIsPage).not.toHaveBeenCalled();
      expect(mockIsHeader).not.toHaveBeenCalled();
      expect(mockIsFooter).not.toHaveBeenCalled();
      expect(mockConstructPagesWithProperties).not.toHaveBeenCalled();
    });

    it('should return empty object when questionnaire has empty items array', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: []
      };

      const result = extractPages(questionnaire);

      expect(result).toEqual({});
      expect(mockIsPage).not.toHaveBeenCalled();
      expect(mockIsHeader).not.toHaveBeenCalled();
      expect(mockIsFooter).not.toHaveBeenCalled();
      expect(mockConstructPagesWithProperties).not.toHaveBeenCalled();
    });

    it('should render questionnaire as paginated when all top-level items are pages', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'page1',
            type: 'group',
            text: 'Page 1'
          },
          {
            linkId: 'page2',
            type: 'group',
            text: 'Page 2'
          }
        ]
      };

      // For .every() check - all return true for pages
      mockIsPage.mockReturnValue(true);
      mockIsHeader.mockReturnValue(false);
      mockIsFooter.mockReturnValue(false);
      
      mockConstructPagesWithProperties.mockReturnValue({
        'page1': { pageIndex: 0, isComplete: false, isHidden: false },
        'page2': { pageIndex: 1, isComplete: false, isHidden: false }
      });

      const result = extractPages(questionnaire);

      // Each item is checked once in the .every() call
      expect(mockIsPage).toHaveBeenCalledTimes(2);
      // isHeader and isFooter are NOT called due to short-circuit evaluation (isPage returns true)
      expect(mockIsHeader).toHaveBeenCalledTimes(0);
      expect(mockIsFooter).toHaveBeenCalledTimes(0);
      expect(mockConstructPagesWithProperties).toHaveBeenCalledWith(questionnaire.item, false);
      expect(result).toEqual({
        'page1': { pageIndex: 0, isComplete: false, isHidden: false },
        'page2': { pageIndex: 1, isComplete: false, isHidden: false }
      });
    });

    it('should render questionnaire as paginated when all top-level items are headers', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'header1',
            type: 'group',
            text: 'Header 1'
          },
          {
            linkId: 'header2',
            type: 'group',
            text: 'Header 2'
          }
        ]
      };

      mockIsPage.mockReturnValue(false);
      mockIsHeader.mockReturnValue(true);
      mockIsFooter.mockReturnValue(false);
      mockConstructPagesWithProperties.mockReturnValue({
        'header1': { pageIndex: 0, isComplete: false, isHidden: false },
        'header2': { pageIndex: 1, isComplete: false, isHidden: false }
      });

      const result = extractPages(questionnaire);

      expect(mockConstructPagesWithProperties).toHaveBeenCalledWith(questionnaire.item, false);
      expect(result).toEqual({
        'header1': { pageIndex: 0, isComplete: false, isHidden: false },
        'header2': { pageIndex: 1, isComplete: false, isHidden: false }
      });
    });

    it('should render questionnaire as paginated when all top-level items are footers', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'footer1',
            type: 'group',
            text: 'Footer 1'
          }
        ]
      };

      mockIsPage.mockReturnValue(false);
      mockIsHeader.mockReturnValue(false);
      mockIsFooter.mockReturnValue(true);
      mockConstructPagesWithProperties.mockReturnValue({
        'footer1': { pageIndex: 0, isComplete: false, isHidden: false }
      });

      const result = extractPages(questionnaire);

      expect(mockConstructPagesWithProperties).toHaveBeenCalledWith(questionnaire.item, false);
      expect(result).toEqual({
        'footer1': { pageIndex: 0, isComplete: false, isHidden: false }
      });
    });

    it('should render questionnaire as paginated when all top-level items are mix of pages, headers, and footers', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'header1',
            type: 'group',
            text: 'Header 1'
          },
          {
            linkId: 'page1',
            type: 'group',
            text: 'Page 1'
          },
          {
            linkId: 'footer1',
            type: 'group',
            text: 'Footer 1'
          }
        ]
      };

      // Create a more reliable mock setup
      mockIsPage.mockImplementation((item) => {
        if (item.linkId === 'header1') return false;
        if (item.linkId === 'page1') return true;
        if (item.linkId === 'footer1') return false;
        return false;
      });
      mockIsHeader.mockImplementation((item) => {
        if (item.linkId === 'header1') return true;
        return false;
      });
      mockIsFooter.mockImplementation((item) => {
        if (item.linkId === 'footer1') return true;
        return false;
      });

      mockConstructPagesWithProperties.mockReturnValue({
        'header1': { pageIndex: 0, isComplete: false, isHidden: false },
        'page1': { pageIndex: 1, isComplete: false, isHidden: false },
        'footer1': { pageIndex: 2, isComplete: false, isHidden: false }
      });

      const result = extractPages(questionnaire);

      expect(mockConstructPagesWithProperties).toHaveBeenCalledWith(questionnaire.item, false);
      expect(result).toEqual({
        'header1': { pageIndex: 0, isComplete: false, isHidden: false },
        'page1': { pageIndex: 1, isComplete: false, isHidden: false },
        'footer1': { pageIndex: 2, isComplete: false, isHidden: false }
      });
    });

    it('should use page-container approach when not all items are pages/headers/footers but a page exists', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'regular-item',
            type: 'string',
            text: 'Regular question'
          },
          {
            linkId: 'page-container',
            type: 'group',
            text: 'Page Container',
            item: [
              {
                linkId: 'child-page1',
                type: 'group',
                text: 'Child Page 1'
              },
              {
                linkId: 'child-page2',
                type: 'group',
                text: 'Child Page 2'
              }
            ]
          }
        ]
      };

      // First .every() check will fail because regular-item is not a page/header/footer
      mockIsPage
        .mockReturnValueOnce(false)  // regular-item: not a page (fails .every())
        .mockReturnValueOnce(false)  // regular-item in .find()
        .mockReturnValueOnce(true);  // page-container in .find()
      mockIsHeader.mockReturnValue(false);
      mockIsFooter.mockReturnValue(false);

      mockConstructPagesWithProperties.mockReturnValue({
        'child-page1': { pageIndex: 0, isComplete: false, isHidden: false },
        'child-page2': { pageIndex: 1, isComplete: false, isHidden: false }
      });

      const result = extractPages(questionnaire);

      expect(mockConstructPagesWithProperties).toHaveBeenCalledWith(
        questionnaire.item![1].item, // page-container's children
        true // isUsingPageContainerApproach
      );
      expect(result).toEqual({
        'child-page1': { pageIndex: 0, isComplete: false, isHidden: false },
        'child-page2': { pageIndex: 1, isComplete: false, isHidden: false }
      });
    });

    it('should return empty object when not all items are pages/headers/footers and no page item exists', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'regular-item1',
            type: 'string',
            text: 'Regular question 1'
          },
          {
            linkId: 'regular-item2',
            type: 'integer',
            text: 'Regular question 2'
          }
        ]
      };

      // All items fail the .every() check AND no page container exists in .find()
      mockIsPage.mockReturnValue(false);
      mockIsHeader.mockReturnValue(false);
      mockIsFooter.mockReturnValue(false);

      const result = extractPages(questionnaire);

      expect(mockConstructPagesWithProperties).not.toHaveBeenCalled();
      expect(result).toEqual({});
    });

    it('should handle page container with no child items', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'page-container',
            type: 'group',
            text: 'Empty Page Container'
            // no item property
          }
        ]
      };

      // Fails .every() check, then finds page container in .find()
      mockIsPage
        .mockReturnValueOnce(false)  // .every() fails immediately
        .mockReturnValueOnce(true);  // .find() succeeds
      mockIsHeader.mockReturnValue(false);
      mockIsFooter.mockReturnValue(false);

      mockConstructPagesWithProperties.mockReturnValue({});

      const result = extractPages(questionnaire);

      expect(mockConstructPagesWithProperties).toHaveBeenCalledWith(
        undefined, // no child items
        true
      );
      expect(result).toEqual({});
    });

    it('should handle page container with empty child items array', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'page-container',
            type: 'group',
            text: 'Empty Page Container',
            item: []
          }
        ]
      };

      // Fails .every() check, then finds page container in .find()
      mockIsPage
        .mockReturnValueOnce(false)  // .every() fails immediately
        .mockReturnValueOnce(true);  // .find() succeeds
      mockIsHeader.mockReturnValue(false);
      mockIsFooter.mockReturnValue(false);

      mockConstructPagesWithProperties.mockReturnValue({});

      const result = extractPages(questionnaire);

      expect(mockConstructPagesWithProperties).toHaveBeenCalledWith([], true);
      expect(result).toEqual({});
    });

    it('should find first page item as page container when multiple page items exist', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'regular-item',
            type: 'string',
            text: 'Regular question'
          },
          {
            linkId: 'first-page-container',
            type: 'group',
            text: 'First Page Container',
            item: [
              {
                linkId: 'page1',
                type: 'group',
                text: 'Page 1'
              }
            ]
          },
          {
            linkId: 'second-page-container',
            type: 'group',
            text: 'Second Page Container',
            item: [
              {
                linkId: 'page2',
                type: 'group',
                text: 'Page 2'
              }
            ]
          }
        ]
      };

      // Fails .every() check, then finds first page container in .find()
      mockIsPage
        .mockReturnValueOnce(false)  // .every() fails on first item
        .mockReturnValueOnce(false)  // regular-item in .find()
        .mockReturnValueOnce(true);  // first-page-container found in .find()
      mockIsHeader.mockReturnValue(false);
      mockIsFooter.mockReturnValue(false);

      mockConstructPagesWithProperties.mockReturnValue({
        'page1': { pageIndex: 0, isComplete: false, isHidden: false }
      });

      const result = extractPages(questionnaire);

      expect(mockConstructPagesWithProperties).toHaveBeenCalledWith(
        questionnaire.item![1].item, // first-page-container's children
        true
      );
      expect(result).toEqual({
        'page1': { pageIndex: 0, isComplete: false, isHidden: false }
      });
    });

    it('should handle constructPagesWithProperties returning empty object', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'page1',
            type: 'group',
            text: 'Page 1'
          }
        ]
      };

      mockIsPage.mockReturnValue(true);
      mockIsHeader.mockReturnValue(false);
      mockIsFooter.mockReturnValue(false);
      mockConstructPagesWithProperties.mockReturnValue({});

      const result = extractPages(questionnaire);

      expect(result).toEqual({});
    });
  });
});
