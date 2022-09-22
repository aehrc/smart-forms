import React, { useEffect, useState } from 'react';
import QForm from './QForm';
import ProgressSpinner from './ProgressSpinner';
import NavBar from '../NavBar';
import { oauth2 } from 'fhirclient';
import { getPatient } from './functions/LaunchFunctions';
import { Patient } from 'fhir/r5';
import FhirClient from './functions/FhirClient';
import { QuestionnaireService } from './QuestionnaireService';

function QPage() {
  const questionnaire = new QuestionnaireService();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    oauth2
      .ready()
      .then((client) => {
        const fhirClient = new FhirClient(client);
        getPatient(client).then((patient) => {
          fhirClient.populate(questionnaire, patient, (qResponse) => {
            console.log(qResponse);
            setLoading(false);
          });
          setPatient(patient);
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
    <QForm questionnaire={questionnaire} />
  );

  return (
    <div>
      <NavBar patient={patient} />
      {renderQPage}
    </div>
  );
}

export default QPage;
