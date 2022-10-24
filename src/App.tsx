import React from 'react';
import './App.css';
import { CssBaseline, useMediaQuery } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import getTheme from './theme';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Launch from './components/LaunchPage/Launch';
import { QuestionnaireProvider } from './classes/QuestionnaireProvider';
import LaunchContextProvider from './custom-contexts/LaunchContext';
import QAuth from './components/QRenderer/QAuth';
import { QuestionnaireResponseProvider } from './classes/QuestionnaireResponseProvider';

const questionnaireProvider = new QuestionnaireProvider();
questionnaireProvider.readCalculatedExpressionsAndEnableWhenItems();
questionnaireProvider.readVariables();

const questionnaireResponseProvider = new QuestionnaireResponseProvider();

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  return (
    <ThemeProvider theme={getTheme(prefersDarkMode)}>
      <LaunchContextProvider>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <QAuth
                  questionnaireProvider={questionnaireProvider}
                  questionnaireResponseProvider={questionnaireResponseProvider}
                />
              }
            />
            <Route path="/launch" element={<Launch />} />
          </Routes>
        </BrowserRouter>
      </LaunchContextProvider>
    </ThemeProvider>
  );
}

export default App;
