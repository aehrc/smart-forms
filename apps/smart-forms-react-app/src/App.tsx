import React from 'react';
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
questionnaireProvider.readCalculatedExpressionsAndEnableWhenItems();
questionnaireProvider.readVariables();
const questionnaireResponseProvider = new QuestionnaireResponseProvider();

export const QuestionnaireProviderContext =
  React.createContext<QuestionnaireProvider>(questionnaireProvider);
export const QuestionnaireResponseProviderContext =
  React.createContext<QuestionnaireResponseProvider>(questionnaireResponseProvider);

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
