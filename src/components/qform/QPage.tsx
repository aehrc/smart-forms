import React, { useEffect, useState } from 'react';
import QForm from './QForm';
import ProgressSpinner from './ProgressSpinner';
import NavBar from '../NavBar';
import { oauth2 } from 'fhirclient';
import { getPatient } from './functions/LaunchFunctions';
import { Patient } from 'fhir/r5';

function QPage() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    oauth2
      .ready()
      .then((client) => {
        getPatient(client).then((patient) => {
          setPatient(patient);
          setLoading(false);
        });
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  const renderQPage = loading ? (
    <ProgressSpinner message={'Loading questionnaire form'} />
  ) : (
    <QForm />
  );

  return (
    <div>
      <NavBar patient={patient} />
      {renderQPage}
    </div>
  );
}

export default QPage;
