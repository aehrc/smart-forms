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

import ReactDOM from 'react-dom/client';
import App from './App';
import type { DefaultOptions } from '@tanstack/react-query';
import { keepPreviousData, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Sentry from '@sentry/react';
import { browserTracingIntegration } from '@sentry/browser';
import ConfigContextProvider from './features/configChecker/contexts/ConfigContextProvider';
import { CssBaseline } from '@mui/material';
import ThemeProvider from './theme/Theme';
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

// Configure Monaco Editor to use local workers instead of CDN
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker();
    }
    return new editorWorker();
  }
};

loader.config({ monaco });

const integration = browserTracingIntegration();

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.REACT_APP_SENTRY_ENVIRONMENT,
    release: process.env.REACT_APP_SENTRY_RELEASE,
    integrations: [integration],
    tracesSampleRate: 1.0
  });
}

const DEFAULT_QUERY_OPTIONS: DefaultOptions = {
  queries: {
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData
  }
};

const queryClient = new QueryClient({
  defaultOptions: DEFAULT_QUERY_OPTIONS
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <ConfigContextProvider>
      <ThemeProvider>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </ConfigContextProvider>
  </QueryClientProvider>
);
