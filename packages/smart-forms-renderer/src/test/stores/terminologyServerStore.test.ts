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

import { terminologyServerStore } from '../../stores/terminologyServerStore';
import { TERMINOLOGY_SERVER_URL } from '../../globals';

describe('terminologyServerStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    terminologyServerStore.getState().resetUrl();
  });

  describe('initial state', () => {
    it('should have default URL from globals', () => {
      const state = terminologyServerStore.getState();
      expect(state.url).toBe(TERMINOLOGY_SERVER_URL);
    });
  });

  describe('setUrl', () => {
    it('should set a new URL', () => {
      const newUrl = 'https://test.terminology.server/fhir';
      terminologyServerStore.getState().setUrl(newUrl);
      
      const state = terminologyServerStore.getState();
      expect(state.url).toBe(newUrl);
    });

    it('should update URL when called multiple times', () => {
      const firstUrl = 'https://first.server/fhir';
      const secondUrl = 'https://second.server/fhir';
      
      terminologyServerStore.getState().setUrl(firstUrl);
      expect(terminologyServerStore.getState().url).toBe(firstUrl);
      
      terminologyServerStore.getState().setUrl(secondUrl);
      expect(terminologyServerStore.getState().url).toBe(secondUrl);
    });

    it('should handle empty string', () => {
      terminologyServerStore.getState().setUrl('');
      expect(terminologyServerStore.getState().url).toBe('');
    });
  });

  describe('resetUrl', () => {
    it('should reset URL to default after being changed', () => {
      const customUrl = 'https://custom.server/fhir';
      terminologyServerStore.getState().setUrl(customUrl);
      expect(terminologyServerStore.getState().url).toBe(customUrl);
      
      terminologyServerStore.getState().resetUrl();
      expect(terminologyServerStore.getState().url).toBe(TERMINOLOGY_SERVER_URL);
    });

    it('should not change URL if already at default', () => {
      expect(terminologyServerStore.getState().url).toBe(TERMINOLOGY_SERVER_URL);
      
      terminologyServerStore.getState().resetUrl();
      expect(terminologyServerStore.getState().url).toBe(TERMINOLOGY_SERVER_URL);
    });
  });

  describe('store subscription', () => {
    it('should notify subscribers when URL changes', () => {
      const mockSubscriber = jest.fn();
      const unsubscribe = terminologyServerStore.subscribe(mockSubscriber);
      
      terminologyServerStore.getState().setUrl('https://new.server/fhir');
      
      expect(mockSubscriber).toHaveBeenCalled();
      unsubscribe();
    });

    it('should notify subscribers when URL is reset', () => {
      const mockSubscriber = jest.fn();
      
      // Change URL first
      terminologyServerStore.getState().setUrl('https://custom.server/fhir');
      
      // Subscribe and reset
      const unsubscribe = terminologyServerStore.subscribe(mockSubscriber);
      terminologyServerStore.getState().resetUrl();
      
      expect(mockSubscriber).toHaveBeenCalled();
      unsubscribe();
    });
  });
});

