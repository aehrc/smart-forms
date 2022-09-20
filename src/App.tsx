import React from 'react';
import './App.css';
import { CssBaseline, useMediaQuery } from '@mui/material';
import QForm from './components/qform/QForm';
import { ThemeProvider } from '@mui/material/styles';
import getTheme from './theme';

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  return (
    <ThemeProvider theme={getTheme(prefersDarkMode)}>
      <CssBaseline />
      <QForm />
    </ThemeProvider>
  );
}

export default App;
