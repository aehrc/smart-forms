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

import { RepopulationStore, useRepopulationStore } from '../stores/RepopulationStore';
import type { ItemToRepopulate } from '@aehrc/smart-forms-renderer';
import type { QuestionnaireItem } from 'fhir/r4';

describe('RepopulationStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    RepopulationStore.getState().setItemsToRepopulate({});
  });

  describe('initial state', () => {
    it('has correct initial values', () => {
      const state = RepopulationStore.getState();
      expect(state.itemsToRepopulate).toEqual({});
    });
  });

  describe('setItemsToRepopulate', () => {
    it('sets itemsToRepopulate correctly', () => {
      const mockQItem: QuestionnaireItem = {
        linkId: 'item1',
        type: 'string',
        text: 'Test Item 1'
      };

      const mockItems: Record<string, ItemToRepopulate> = {
        item1: {
          qItem: mockQItem,
          sectionItemText: 'Section 1',
          parentItemText: 'Parent 1',
          isInGrid: false,
          serverQRItem: {
            linkId: 'item1',
            answer: [{ valueString: 'server value' }]
          },
          currentQRItem: {
            linkId: 'item1',
            answer: [{ valueString: 'current value' }]
          }
        },
        item2: {
          qItem: {
            linkId: 'item2',
            type: 'boolean',
            text: 'Test Item 2'
          },
          sectionItemText: 'Section 2',
          parentItemText: null,
          isInGrid: true
        }
      };

      RepopulationStore.getState().setItemsToRepopulate(mockItems);

      const state = RepopulationStore.getState();
      expect(state.itemsToRepopulate).toEqual(mockItems);
    });

    it('replaces existing itemsToRepopulate', () => {
      const initialItems: Record<string, ItemToRepopulate> = {
        initial: {
          qItem: {
            linkId: 'initial',
            type: 'string',
            text: 'Initial Item'
          },
          sectionItemText: 'Initial Section',
          parentItemText: null,
          isInGrid: false
        }
      };

      const newItems: Record<string, ItemToRepopulate> = {
        new: {
          qItem: {
            linkId: 'new',
            type: 'string',
            text: 'New Item'
          },
          sectionItemText: 'New Section',
          parentItemText: null,
          isInGrid: true
        }
      };

      RepopulationStore.getState().setItemsToRepopulate(initialItems);
      expect(RepopulationStore.getState().itemsToRepopulate).toEqual(initialItems);

      RepopulationStore.getState().setItemsToRepopulate(newItems);
      expect(RepopulationStore.getState().itemsToRepopulate).toEqual(newItems);
    });

    it('sets empty object when called with empty object', () => {
      const mockItems: Record<string, ItemToRepopulate> = {
        item1: {
          qItem: {
            linkId: 'item1',
            type: 'string',
            text: 'Test Item'
          },
          sectionItemText: 'Section',
          parentItemText: null,
          isInGrid: false
        }
      };

      RepopulationStore.getState().setItemsToRepopulate(mockItems);
      expect(RepopulationStore.getState().itemsToRepopulate).toEqual(mockItems);

      RepopulationStore.getState().setItemsToRepopulate({});
      expect(RepopulationStore.getState().itemsToRepopulate).toEqual({});
    });
  });

  describe('useRepopulationStore selector', () => {
    it('creates selectors successfully', () => {
      expect(useRepopulationStore).toBeDefined();
      expect(useRepopulationStore.use).toBeDefined();
      expect(useRepopulationStore.use.itemsToRepopulate).toBeDefined();
      expect(useRepopulationStore.use.setItemsToRepopulate).toBeDefined();
    });
  });
});
