import React from 'react';
import './App.css';
import { CssBaseline, useMediaQuery } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import getTheme from './theme';
import QPage from './components/qform/QPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Launch from './components/Launch';
import QuestionnairePicker from './components/QuestionnairePicker/QuestionnairePicker';
import { QuestionnaireProvider } from './components/qform/QuestionnaireProvider';

const questionnaireProvider = new QuestionnaireProvider();
questionnaireProvider.readCalculatedExpressionsAndEnableWhenItems();
questionnaireProvider.readVariables();

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  return (
    <ThemeProvider theme={getTheme(prefersDarkMode)}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<QPage questionnaireProvider={questionnaireProvider} />} />
          <Route
            path="/picker"
            element={<QuestionnairePicker questionnaireProvider={questionnaireProvider} />}
          />
          <Route path="/launch" element={<Launch />} />
          <Route path="*" element={<QPage questionnaireProvider={questionnaireProvider} />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
