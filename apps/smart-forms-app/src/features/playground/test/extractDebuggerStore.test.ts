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

import type { Observation, OperationOutcome } from 'fhir/r4';
import { extractDebuggerStore, useExtractDebuggerStore } from '../stores/extractDebuggerStore';

describe('extractDebuggerStore', () => {
  beforeEach(() => {
    // Reset store before each test
    extractDebuggerStore.getState().resetStore();
  });

  describe('initial state', () => {
    it('has correct initial values', () => {
      const state = extractDebuggerStore.getState();

      expect(state.observationExtractResult).toBe(null);
      expect(state.templateExtractResult).toBe(null);
      expect(state.templateExtractDebugInfo).toBe(null);
      expect(state.templateExtractIssues).toBe(null);
    });
  });

  describe('observation-based extraction', () => {
    it('sets and gets observationExtractResult', () => {
      const mockObservations: Observation[] = [
        {
          resourceType: 'Observation',
          id: 'obs-1',
          status: 'final',
          code: { text: 'Test observation' }
        }
      ];

      extractDebuggerStore.getState().setObservationExtractResult(mockObservations);

      expect(extractDebuggerStore.getState().observationExtractResult).toEqual(mockObservations);
    });

    it('sets observationExtractResult to null', () => {
      // First set a value
      const mockObservations: Observation[] = [
        {
          resourceType: 'Observation',
          id: 'obs-1',
          status: 'final',
          code: { text: 'Test observation' }
        }
      ];
      extractDebuggerStore.getState().setObservationExtractResult(mockObservations);

      // Then set to null
      extractDebuggerStore.getState().setObservationExtractResult(null);

      expect(extractDebuggerStore.getState().observationExtractResult).toBe(null);
    });
  });

  describe('template-based extraction', () => {
    it('sets and gets templateExtractResult', () => {
      const mockResource = {
        resourceType: 'Patient' as const,
        id: 'patient-1',
        active: true
      };

      extractDebuggerStore.getState().setTemplateExtractResult(mockResource);

      expect(extractDebuggerStore.getState().templateExtractResult).toEqual(mockResource);
    });

    it('sets and gets templateExtractIssues', () => {
      const mockIssues: OperationOutcome = {
        resourceType: 'OperationOutcome',
        issue: [
          {
            severity: 'error',
            code: 'processing',
            diagnostics: 'Test error'
          }
        ]
      };

      extractDebuggerStore.getState().setTemplateExtractIssues(mockIssues);

      expect(extractDebuggerStore.getState().templateExtractIssues).toEqual(mockIssues);
    });
  });

  describe('resetStore', () => {
    it('resets all values to initial state', () => {
      const {
        setObservationExtractResult,
        setTemplateExtractResult,
        setTemplateExtractIssues,
        resetStore
      } = extractDebuggerStore.getState();

      // Set some values
      setObservationExtractResult([
        {
          resourceType: 'Observation',
          id: 'obs-1',
          status: 'final',
          code: { text: 'Test' }
        }
      ]);
      setTemplateExtractResult({ resourceType: 'Patient', id: 'patient-1', active: true });
      setTemplateExtractIssues({
        resourceType: 'OperationOutcome',
        issue: [{ severity: 'error', code: 'processing' }]
      });

      // Reset
      resetStore();

      const state = extractDebuggerStore.getState();
      expect(state.observationExtractResult).toBe(null);
      expect(state.templateExtractResult).toBe(null);
      expect(state.templateExtractDebugInfo).toBe(null);
      expect(state.templateExtractIssues).toBe(null);
    });
  });

  describe('useExtractDebuggerStore selector', () => {
    it('creates selectors successfully', () => {
      expect(useExtractDebuggerStore).toBeDefined();
      expect(typeof useExtractDebuggerStore.use).toBe('object');
    });
  });
});
