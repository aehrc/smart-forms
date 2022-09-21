import React from 'react';
import './App.css';
import { CssBaseline, useMediaQuery } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import getTheme from './theme';
import NavBar from './components/NavBar';
import Client from 'fhirclient/lib/Client';
import QPage from './components/qform/QPage';

function App(props: { client: Client }) {
  const { client } = props;

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: light)');

  return (
    <ThemeProvider theme={getTheme(prefersDarkMode)}>
      <CssBaseline />
      <NavBar />
      <QPage client={client} />
    </ThemeProvider>
  );
}

export default App;
