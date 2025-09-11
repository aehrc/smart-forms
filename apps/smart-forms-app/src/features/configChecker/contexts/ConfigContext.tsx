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

import { createContext } from 'react';
import type { AppConfig } from '../utils/config.ts';
import { FALLBACK_CONFIG } from '../utils/config.ts';

export type ConfigErrorType = 'configJson' | 'registeredClientIds' | null;

export interface ConfigContextType {
  config: AppConfig;
  configLoading: boolean;
  configValid: boolean;
  configError: Error | null;
  configErrorType: ConfigErrorType | null;
}

export const ConfigContext = createContext<ConfigContextType>({
  config: FALLBACK_CONFIG,
  configLoading: true,
  configValid: false,
  configError: null,
  configErrorType: null
});
