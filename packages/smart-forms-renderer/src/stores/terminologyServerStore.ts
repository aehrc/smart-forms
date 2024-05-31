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
import { createSelectors } from './selector';
import { TERMINOLOGY_SERVER_URL } from '../globals';

/**
 * TerminologyServerStore properties and methods
 * Properties can be accessed for fine-grain details.
 * Methods are usually used internally, using them from an external source is not recommended.
 *
 * @property url - The current terminology server URL
 * @property setUrl - Set the terminology server URL
 * @property resetUrl - Reset the terminology server URL to the default
 *
 * @author Sean Fong
 */
export interface TerminologyServerStoreType {
  url: string;
  setUrl: (newUrl: string) => void;
  resetUrl: () => void;
}

/**
 * Terminology server state management store. This is used for resolving valueSets externally.
 * Defaults to use https://tx.ontoserver.csiro.au/fhir.
 * This is the vanilla version of the store which can be used in non-React environments.
 * @see TerminologyServerStoreType for available properties and methods.
 *
 * @author Sean Fong
 */
export const terminologyServerStore = createStore<TerminologyServerStoreType>()((set) => ({
  url: TERMINOLOGY_SERVER_URL,
  setUrl: (newUrl: string) => set(() => ({ url: newUrl })),
  resetUrl: () => set(() => ({ url: TERMINOLOGY_SERVER_URL }))
}));

/**
 * Terminology server state management store. This is used for resolving valueSets externally.
 * Defaults to use https://tx.ontoserver.csiro.au/fhir.
 * This is the React version of the store which can be used as React hooks in React functional components.
 * @see TerminologyServerStoreType for available properties and methods.
 *
 * @author Sean Fong
 */
export const useTerminologyServerStore = createSelectors(terminologyServerStore);
