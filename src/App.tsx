import React, { useState, createContext, useEffect } from 'react';
import './App.css';
import { CssBaseline, useMediaQuery } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import getTheme from './theme';
import NavBar from './components/NavBar';
import QPage from './components/qform/QPage';
import { getPatient } from './components/qform/functions/LaunchFunctions';
import Client from 'fhirclient/lib/Client';
import { Patient } from 'fhir/r5';

export const PatientContext = createContext<Patient | null>(null);

function App(props: { client: Client }) {
  const { client } = props;

  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const patientPromise = getPatient(client);
    patientPromise
      .then((patientResource) => {
        setPatient(patientResource);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [client]);

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: light)');
  return (
    <ThemeProvider theme={getTheme(prefersDarkMode)}>
      <CssBaseline />
      <PatientContext.Provider value={patient}>
        <NavBar />
        <QPage />
      </PatientContext.Provider>
    </ThemeProvider>
  );
}

export default App;
