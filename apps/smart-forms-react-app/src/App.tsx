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

import React, { createContext } from 'react';
import './App.css';
import { CssBaseline, useMediaQuery } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import getTheme from './theme';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Launch from './components/LaunchPage/Launch';
import { QuestionnaireProvider } from './classes/QuestionnaireProvider';
import LaunchContextProvider from './custom-contexts/LaunchContext';
import Auth from './components/Auth';
import { QuestionnaireResponseProvider } from './classes/QuestionnaireResponseProvider';

const questionnaireProvider = new QuestionnaireProvider();
const questionnaireResponseProvider = new QuestionnaireResponseProvider();

export const QuestionnaireProviderContext =
  createContext<QuestionnaireProvider>(questionnaireProvider);
export const QuestionnaireResponseProviderContext = createContext<QuestionnaireResponseProvider>(
  questionnaireResponseProvider
);

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  return (
    <ThemeProvider theme={getTheme(prefersDarkMode)}>
      <QuestionnaireProviderContext.Provider value={questionnaireProvider}>
        <QuestionnaireResponseProviderContext.Provider value={questionnaireResponseProvider}>
          <LaunchContextProvider>
            <CssBaseline />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Auth />} />
                <Route path="/launch" element={<Launch />} />
              </Routes>
            </BrowserRouter>
          </LaunchContextProvider>
        </QuestionnaireResponseProviderContext.Provider>
      </QuestionnaireProviderContext.Provider>
    </ThemeProvider>
  );
}

export default App;
