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
import { extractTabs } from '../utils/questionnaireStoreUtils/extractTabs';

// Mock the tabs utility functions
jest.mock('../utils/tabs', () => ({
  constructTabsWithProperties: jest.fn(),
  isTabContainer: jest.fn()
}));

import { constructTabsWithProperties, isTabContainer } from '../utils/tabs';

const mockConstructTabsWithProperties = constructTabsWithProperties as jest.MockedFunction<typeof constructTabsWithProperties>;
const mockIsTabContainer = isTabContainer as jest.MockedFunction<typeof isTabContainer>;

describe('extractTabs - Phase 5', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractTabs', () => {
    it('should return empty object when questionnaire has no items', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active'
      };

      const result = extractTabs(questionnaire);

      expect(result).toEqual({});
      expect(mockIsTabContainer).not.toHaveBeenCalled();
      expect(mockConstructTabsWithProperties).not.toHaveBeenCalled();
    });

    it('should return empty object when questionnaire has empty items array', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: []
      };

      const result = extractTabs(questionnaire);

      expect(result).toEqual({});
      expect(mockIsTabContainer).not.toHaveBeenCalled();
      expect(mockConstructTabsWithProperties).not.toHaveBeenCalled();
    });

    it('should process single top-level item that is not a tab container', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'group1',
            type: 'group',
            text: 'Group 1',
            item: [
              {
                linkId: 'item1',
                type: 'string',
                text: 'Question 1'
              }
            ]
          }
        ]
      };

      mockIsTabContainer.mockReturnValue(false);
      mockConstructTabsWithProperties.mockReturnValue({
        'tab1': { tabIndex: 0, isComplete: false, isHidden: false }
      });

      const result = extractTabs(questionnaire);

      expect(mockIsTabContainer).toHaveBeenCalledWith(questionnaire.item![0]);
      expect(mockConstructTabsWithProperties).toHaveBeenCalledWith(
        questionnaire.item![0].item,
        false
      );
      expect(result).toEqual({
        'tab1': { tabIndex: 0, isComplete: false, isHidden: false }
      });
    });

    it('should process single top-level item that is a tab container', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'tab-container',
            type: 'group',
            text: 'Tab Container',
            item: [
              {
                linkId: 'tab1',
                type: 'group',
                text: 'Tab 1',
                extension: [
                  {
                    url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                    valueCodeableConcept: {
                      coding: [
                        {
                          system: 'http://hl7.org/fhir/questionnaire-item-control',
                          code: 'tab'
                        }
                      ]
                    }
                  }
                ]
              }
            ]
          }
        ]
      };

      mockIsTabContainer.mockReturnValue(true);
      mockConstructTabsWithProperties.mockReturnValue({
        'tab1': { tabIndex: 0, isComplete: false, isHidden: false }
      });

      const result = extractTabs(questionnaire);

      expect(mockIsTabContainer).toHaveBeenCalledWith(questionnaire.item![0]);
      expect(mockConstructTabsWithProperties).toHaveBeenCalledWith(
        questionnaire.item![0].item,
        true
      );
      expect(result).toEqual({
        'tab1': { tabIndex: 0, isComplete: false, isHidden: false }
      });
    });

    it('should process multiple top-level items and merge their tabs', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'group1',
            type: 'group',
            text: 'Group 1',
            item: [
              {
                linkId: 'tab1',
                type: 'group',
                text: 'Tab 1'
              }
            ]
          },
          {
            linkId: 'group2',
            type: 'group',
            text: 'Group 2',
            item: [
              {
                linkId: 'tab2',
                type: 'group',
                text: 'Tab 2'
              }
            ]
          }
        ]
      };

      mockIsTabContainer
        .mockReturnValueOnce(false)  // for group1
        .mockReturnValueOnce(true);  // for group2

      mockConstructTabsWithProperties
        .mockReturnValueOnce({
          'tab1': { tabIndex: 0, isComplete: false, isHidden: false }
        })
        .mockReturnValueOnce({
          'tab2': { tabIndex: 1, isComplete: false, isHidden: false }
        });

      const result = extractTabs(questionnaire);

      expect(mockIsTabContainer).toHaveBeenCalledTimes(2);
      expect(mockConstructTabsWithProperties).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        'tab1': { tabIndex: 0, isComplete: false, isHidden: false },
        'tab2': { tabIndex: 1, isComplete: false, isHidden: false }
      });
    });

    it('should handle top-level items without child items', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'item1',
            type: 'string',
            text: 'Simple Question'
            // no item property
          }
        ]
      };

      mockIsTabContainer.mockReturnValue(false);
      mockConstructTabsWithProperties.mockReturnValue({});

      const result = extractTabs(questionnaire);

      expect(mockIsTabContainer).toHaveBeenCalledWith(questionnaire.item![0]);
      expect(mockConstructTabsWithProperties).toHaveBeenCalledWith(
        undefined,  // no items property
        false
      );
      expect(result).toEqual({});
    });

    it('should handle top-level items with empty child items array', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'group1',
            type: 'group',
            text: 'Empty Group',
            item: []
          }
        ]
      };

      mockIsTabContainer.mockReturnValue(false);
      mockConstructTabsWithProperties.mockReturnValue({});

      const result = extractTabs(questionnaire);

      expect(mockIsTabContainer).toHaveBeenCalledWith(questionnaire.item![0]);
      expect(mockConstructTabsWithProperties).toHaveBeenCalledWith([], false);
      expect(result).toEqual({});
    });

    it('should handle overlapping tab keys by merging (last wins)', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'group1',
            type: 'group',
            text: 'Group 1',
            item: [
              {
                linkId: 'tab1',
                type: 'group',
                text: 'Tab 1 from Group 1'
              }
            ]
          },
          {
            linkId: 'group2',
            type: 'group',
            text: 'Group 2',
            item: [
              {
                linkId: 'tab1',  // same linkId as in group1
                type: 'group',
                text: 'Tab 1 from Group 2'
              }
            ]
          }
        ]
      };

      mockIsTabContainer.mockReturnValue(false);
      mockConstructTabsWithProperties
        .mockReturnValueOnce({
          'tab1': { tabIndex: 0, isComplete: false, isHidden: false }
        })
        .mockReturnValueOnce({
          'tab1': { tabIndex: 0, isComplete: false, isHidden: false }
        });

      const result = extractTabs(questionnaire);

      expect(result).toEqual({
        'tab1': { tabIndex: 0, isComplete: false, isHidden: false }
      });
    });

    it('should handle mixed tab containers and regular groups', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'regular-group',
            type: 'group',
            text: 'Regular Group',
            item: [
              {
                linkId: 'question1',
                type: 'string',
                text: 'Question 1'
              }
            ]
          },
          {
            linkId: 'tab-container',
            type: 'group',
            text: 'Tab Container',
            item: [
              {
                linkId: 'tab1',
                type: 'group',
                text: 'Tab 1'
              },
              {
                linkId: 'tab2',
                type: 'group',
                text: 'Tab 2'
              }
            ]
          }
        ]
      };

      mockIsTabContainer
        .mockReturnValueOnce(false)  // regular group
        .mockReturnValueOnce(true);  // tab container

      mockConstructTabsWithProperties
        .mockReturnValueOnce({})  // regular group produces no tabs
        .mockReturnValueOnce({
          'tab1': { tabIndex: 0, isComplete: false, isHidden: false },
          'tab2': { tabIndex: 1, isComplete: false, isHidden: false }
        });

      const result = extractTabs(questionnaire);

      expect(result).toEqual({
        'tab1': { tabIndex: 0, isComplete: false, isHidden: false },
        'tab2': { tabIndex: 1, isComplete: false, isHidden: false }
      });
    });

    it('should handle constructTabsWithProperties returning empty object', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'group1',
            type: 'group',
            text: 'Group 1',
            item: [
              {
                linkId: 'item1',
                type: 'string',
                text: 'Question 1'
              }
            ]
          }
        ]
      };

      mockIsTabContainer.mockReturnValue(false);
      mockConstructTabsWithProperties.mockReturnValue({});

      const result = extractTabs(questionnaire);

      expect(result).toEqual({});
    });
  });
});
