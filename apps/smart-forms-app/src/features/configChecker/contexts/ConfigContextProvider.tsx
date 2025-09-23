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

import type { ReactNode } from 'react';
import { useState } from 'react';
import { ConfigContext } from './ConfigContext.tsx';
import { useLoadConfig } from '../hooks/useLoadConfig.tsx';

const CLIENT_ID_KEY = 'currentClientId';

function ConfigContextProvider(props: { children: ReactNode }) {
  const { children } = props;

  const { config, configLoading, configValid, configError, configErrorType } = useLoadConfig();

  // The resolved client ID actually used for launch. This will be taken from `registeredClientIds` if available for the issuer, otherwise falls back to `defaultClientId`.

  const [currentClientId, setCurrentClientId] = useState<string>(() => {
    return sessionStorage.getItem(CLIENT_ID_KEY) ?? '';
  });

  // Also persist in sessionStorage so it survives page reloads
  function onSetCurrentClientId(id: string) {
    setCurrentClientId(id);

    if (id) {
      sessionStorage.setItem(CLIENT_ID_KEY, id);
    } else {
      sessionStorage.removeItem(CLIENT_ID_KEY);
    }
  }

  return (
    <ConfigContext.Provider
      value={{
        config,
        configLoading,
        configValid,
        configError,
        configErrorType,
        currentClientId,
        onSetCurrentClientId
      }}>
      {children}
    </ConfigContext.Provider>
  );
}

export default ConfigContextProvider;
