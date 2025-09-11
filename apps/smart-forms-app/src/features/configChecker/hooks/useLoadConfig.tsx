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

import { useQuery } from '@tanstack/react-query';
import type { AppConfig, ConfigFile } from '../utils/config.ts';
import {
  FALLBACK_CONFIG,
  loadConfigFile,
  loadRegisteredClientIds,
  responseIsAppConfig
} from '../utils/config.ts';
import type { ConfigContextType, ConfigErrorType } from '../contexts/ConfigContext.tsx';
import { useState } from 'react';

export function useLoadConfig(): ConfigContextType {
  const [configErrorType, setConfigErrorType] = useState<ConfigErrorType>(null);

  const {
    data: loadedConfig,
    isLoading: configLoading,
    error: configError
  } = useQuery<AppConfig>({
    queryKey: ['appConfig'],
    queryFn: async () => {
      // Load config file first
      let configFile: ConfigFile;
      try {
        configFile = await loadConfigFile();
      } catch (err) {
        setConfigErrorType('configJson');
        throw new Error(`[Config Load Error] Failed to load /config.json: ${err}`);
      }

      let registeredClientIds: Record<string, string> | null = null;
      if (configFile.registeredClientIdsUrl) {
        try {
          registeredClientIds = await loadRegisteredClientIds(configFile.registeredClientIdsUrl);
        } catch (err) {
          setConfigErrorType('registeredClientIds');
          throw new Error(
            `[RegisteredClientIds Load Error] Failed to load registered client IDs from ${configFile.registeredClientIdsUrl}: ${err}`
          );
        }
      }

      return { ...configFile, registeredClientIds };
    },
    staleTime: Infinity,
    retry: 1
  });

  let config = FALLBACK_CONFIG;
  if (loadedConfig) {
    config = loadedConfig;
  }

  const configValid = responseIsAppConfig(config);

  // Log error if the config is not valid
  if (configError) {
    console.error(configError);
  }

  return {
    config,
    configValid,
    configLoading,
    configError,
    configErrorType
  };
}
