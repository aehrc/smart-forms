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
import { createSelectors } from '../../../stores/selector.ts';
import type { ItemToRepopulate } from '@aehrc/smart-forms-renderer';

export interface RepopulationStoreType {
  itemsToRepopulate: Record<string, ItemToRepopulate>;
  setItemsToRepopulate: (itemsToRepopulate: Record<string, ItemToRepopulate>) => void;
}

export const RepopulationStore = createStore<RepopulationStoreType>()((set) => ({
  itemsToRepopulate: {},
  setItemsToRepopulate: (itemsToRepopulate: Record<string, ItemToRepopulate>) =>
    set(() => ({ itemsToRepopulate: itemsToRepopulate }))
}));

export const useRepopulationStore = createSelectors(RepopulationStore);
