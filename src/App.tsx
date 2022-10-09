import React from 'react';
import './App.css';
import { CssBaseline, useMediaQuery } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import getTheme from './theme';
import QPage from './components/qform/QPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Launch from './components/Launch';
import QuestionnairePicker from './components/QuestionnairePicker/QuestionnairePicker';

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  return (
    <ThemeProvider theme={getTheme(prefersDarkMode)}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<QPage />} />
          <Route path="/picker" element={<QuestionnairePicker />} />
          <Route path="/launch" element={<Launch />} />
          <Route path="*" element={<QPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
