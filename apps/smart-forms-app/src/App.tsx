/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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
import { CssBaseline } from '@mui/material';
import ThemeProvider from './theme/Theme';
import { QuestionnaireProvider } from './classes/QuestionnaireProvider';
import SmartAppLaunchContextProvider from './custom-contexts/SmartAppLaunchContext.tsx';
import { QuestionnaireResponseProvider } from './classes/QuestionnaireResponseProvider';
import Router from './Router';
import { SnackbarProvider } from 'notistack';
import DebugModeContextProvider from './custom-contexts/DebugModeContext';
import SourceContextProvider from './custom-contexts/SourceContext';
import { CookiesProvider } from 'react-cookie';

const questionnaireProvider = new QuestionnaireProvider();
const questionnaireResponseProvider = new QuestionnaireResponseProvider();

export const QuestionnaireProviderContext =
  createContext<QuestionnaireProvider>(questionnaireProvider);
export const QuestionnaireResponseProviderContext = createContext<QuestionnaireResponseProvider>(
  questionnaireResponseProvider
);

function App() {
  return (
    <ThemeProvider>
      <SnackbarProvider>
        <CookiesProvider>
          <SmartAppLaunchContextProvider>
            <DebugModeContextProvider>
              <SourceContextProvider>
                <QuestionnaireProviderContext.Provider value={questionnaireProvider}>
                  <QuestionnaireResponseProviderContext.Provider
                    value={questionnaireResponseProvider}>
                    <CssBaseline />
                    <Router />
                  </QuestionnaireResponseProviderContext.Provider>
                </QuestionnaireProviderContext.Provider>
              </SourceContextProvider>
            </DebugModeContextProvider>
          </SmartAppLaunchContextProvider>
        </CookiesProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
