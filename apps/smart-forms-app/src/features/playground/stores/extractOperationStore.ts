/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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
import type { StructureMap, QuestionnaireResponse } from 'fhir/r4';
import { createSelectors } from '../../../stores/selector.ts';

export interface ExtractOperationStoreType {
  targetStructureMap: StructureMap | null;
  extractionResult: QuestionnaireResponse | null;
  extractionError: string | null;
  debugInfo: any | null;
  isExtractionStarted: boolean;
  setTargetStructureMap: (structureMap: StructureMap | null) => void;
  setExtractionResult: (result: QuestionnaireResponse | null) => void;
  setExtractionError: (error: string | null) => void;
  setDebugInfo: (info: any | null) => void;
  startExtraction: () => void;
  clearExtraction: () => void;
}

export const extractOperationStore = createStore<ExtractOperationStoreType>()((set) => ({
  targetStructureMap: null,
  extractionResult: null,
  extractionError: null,
  debugInfo: null,
  isExtractionStarted: false,
  setTargetStructureMap: (structureMap: StructureMap | null) =>
    set(() => ({ targetStructureMap: structureMap })),
  setExtractionResult: (result: QuestionnaireResponse | null) =>
    set(() => ({ extractionResult: result, extractionError: null })),
  setExtractionError: (error: string | null) =>
    set(() => ({ extractionError: error, extractionResult: null })),
  setDebugInfo: (info: any | null) =>
    set(() => ({ debugInfo: info })),
  startExtraction: () =>
    set(() => ({ isExtractionStarted: true })),
  clearExtraction: () =>
    set(() => ({
      targetStructureMap: null,
      extractionResult: null,
      extractionError: null,
      debugInfo: null,
      isExtractionStarted: false
    }))
}));

export const useExtractOperationStore = createSelectors(extractOperationStore);
