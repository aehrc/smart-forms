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
import type { StructureMap } from 'fhir/r4';
import { createSelectors } from '../../../stores/selector.ts';

export interface ExtractOperationStoreType {
  targetStructureMap: StructureMap | null;
  extractedResource: any;
  setTargetStructureMap: (structureMap: StructureMap | null) => void;
  setExtractedResource: (extractedResource: any) => void;
  resetStore: () => void;
}

export const extractOperationStore = createStore<ExtractOperationStoreType>()((set) => ({
  targetStructureMap: null,
  extractedResource: null,
  setTargetStructureMap: (structureMap: StructureMap | null) =>
    set(() => ({ targetStructureMap: structureMap })),
  setExtractedResource: (extractedResource: any) =>
    set(() => ({ extractedResource: extractedResource })),
  resetStore: () =>
    set(() => ({
      targetStructureMap: null,
      extractedResource: null
    }))
}));

export const useExtractOperationStore = createSelectors(extractOperationStore);
