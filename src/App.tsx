import React from 'react';
import './App.css';
import { CssBaseline, useMediaQuery } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import getTheme from './theme';
import QRenderer from './components/QRenderer/QRenderer';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Launch from './components/LaunchPage/Launch';
import QuestionnairePicker from './components/QuestionnairePicker/QuestionnairePicker';
import { QuestionnaireProvider } from './classes/QuestionnaireProvider';
import FhirClientProvider from './custom-contexts/FhirClientContext';

const questionnaireProvider = new QuestionnaireProvider();
questionnaireProvider.readCalculatedExpressionsAndEnableWhenItems();
questionnaireProvider.readVariables();

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  return (
    <ThemeProvider theme={getTheme(prefersDarkMode)}>
      <FhirClientProvider>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<QRenderer questionnaireProvider={questionnaireProvider} />} />
            <Route
              path="/picker"
              element={<QuestionnairePicker questionnaireProvider={questionnaireProvider} />}
            />
            <Route path="/launch" element={<Launch />} />
            <Route path="*" element={<QRenderer questionnaireProvider={questionnaireProvider} />} />
          </Routes>
        </BrowserRouter>
      </FhirClientProvider>
    </ThemeProvider>
  );
}

export default App;
