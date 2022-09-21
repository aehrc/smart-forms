import React from 'react';
import './App.css';
import { CssBaseline, useMediaQuery } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import getTheme from './theme';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import QForm from './components/qform/QForm';

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  return (
    <ThemeProvider theme={getTheme(prefersDarkMode)}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/form" element={<QForm />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
