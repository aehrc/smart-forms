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

import { createStore } from 'zustand/vanilla';
import type { FhirResource, Observation, OperationOutcome } from 'fhir/r4';
import { createSelectors } from '../../../stores/selector.ts';
import type { TemplateExtractDebugInfo } from '@aehrc/sdc-template-extract';

export interface ExtractDebuggerStoreType {
  // Observation-based
  observationExtractResult: Observation[] | null;
  setObservationExtractResult: (result: Observation[] | null) => void;

  // Template-based
  templateExtractResult: FhirResource | null;
  templateExtractDebugInfo: TemplateExtractDebugInfo | null;
  templateExtractIssues: OperationOutcome | null;
  setTemplateExtractResult: (result: FhirResource | null) => void;
  setTemplateExtractDebugInfo: (templateExtractDebugInfo: TemplateExtractDebugInfo | null) => void;
  setTemplateExtractIssues: (templateExtractIssues: OperationOutcome | null) => void;

  // Reset store
  resetStore: () => void;
}

export const extractDebuggerStore = createStore<ExtractDebuggerStoreType>()((set) => ({
  // Observation-based
  observationExtractResult: null,
  setObservationExtractResult: (result: Observation[] | null) =>
    set(() => ({ observationExtractResult: result })),

  // Template-based
  templateExtractResult: null,
  templateExtractDebugInfo: null,
  templateExtractIssues: null,
  setTemplateExtractResult: (result: FhirResource | null) =>
    set(() => ({ templateExtractResult: result })),
  setTemplateExtractDebugInfo: (templateExtractDebugInfo: TemplateExtractDebugInfo | null) =>
    set(() => ({ templateExtractDebugInfo })),
  setTemplateExtractIssues: (templateExtractIssues: OperationOutcome | null) =>
    set(() => ({ templateExtractIssues })),

  // Reset store
  resetStore: () =>
    set(() => ({
      observationExtractResult: null,
      templateExtractResult: null,
      templateExtractDebugInfo: null,
      templateExtractIssues: null
    }))
}));

export const useExtractDebuggerStore = createSelectors(extractDebuggerStore);
