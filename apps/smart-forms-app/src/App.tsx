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

import Router from './router/Router.tsx';
import { SnackbarProvider } from 'notistack';
import SmartClientContextProvider from './contexts/SmartClientContext.tsx';
import DebugModeContextProvider from './contexts/DebugModeContext.tsx';
import { ConfigContext } from './features/configChecker/contexts/ConfigContext.tsx';
import { useContext } from 'react';
import type { ConfigFile } from './features/configChecker/utils/config.ts';
import ConfigChecker from './features/configChecker/components/ConfigChecker.tsx';
import ConfigContextProvider from './features/configChecker/contexts/ConfigContextProvider.tsx';
import ProgressSpinner from './components/Spinners/ProgressSpinner.tsx';
import ConfigError from './features/configChecker/components/ConfigError.tsx';

function App() {
  const { config, configLoading, configValid, configError, configErrorType } =
    useContext(ConfigContext);

  // config.json still loading
  if (configLoading) {
    return <ProgressSpinner message="Loading configuration" />;
  }

  // Error loading config.json
  if (configError) {
    return <ConfigError configErrorType={configErrorType} />;
  }

  // config.json loaded but did not pass type validation
  if (!configValid) {
    return <ConfigChecker config={config as Partial<ConfigFile>} />;
  }

  return (
    <SnackbarProvider maxSnack={1}>
      <ConfigContextProvider>
        <SmartClientContextProvider>
          <DebugModeContextProvider>
            <Router />
          </DebugModeContextProvider>
        </SmartClientContextProvider>
      </ConfigContextProvider>
    </SnackbarProvider>
  );
}

export default App;
