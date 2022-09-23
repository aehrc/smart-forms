import React, { useEffect, useState } from 'react';
import QForm from './QForm';
import ProgressSpinner from './ProgressSpinner';
import NavBar from '../NavBar';
import { oauth2 } from 'fhirclient';
import { getPatient } from './functions/LaunchFunctions';
import { Patient, QuestionnaireResponse } from 'fhir/r5';
import FhirClient from '../FhirClient';
import { QuestionnaireService } from './QuestionnaireService';

function QPage() {
  const questionnaire = new QuestionnaireService();

  const [questionnaireResponse, setQuestionnaireResponse] = useState<QuestionnaireResponse>({
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
    item: [
      {
        linkId: questionnaire.item[0].linkId,
        text: questionnaire.item[0].text,
        item: []
      }
    ]
  });
  const [patient, setPatient] = useState<Patient | null>(null);
  const [spinner, setSpinner] = useState({
    isLoading: true,
    message: 'Retrieving patient'
  });

  useEffect(() => {
    oauth2
      .ready()
      .then((client) => {
        const fhirClient = new FhirClient(client);
        getPatient(client)
          .then((patient) => {
            setPatient(patient);
            setSpinner({ ...spinner, message: 'Loading questionnaire form' });

            // obtain questionnaireResponse for prepopulation
            fhirClient.populate(questionnaire, patient, (qResponse) => {
              setQuestionnaireResponse(qResponse);
              setSpinner({ ...spinner, isLoading: false });
            });

            // TODO do calculations and enablewhen
          })
          .catch((error) => {
            console.error(error);
            setSpinner({ ...spinner, isLoading: false });
          });
      })
      .catch((error) => {
        console.error(error);
        setSpinner({ ...spinner, isLoading: false });
      });
  }, []);

  const renderQPage = spinner.isLoading ? (
    <ProgressSpinner message={spinner.message} />
  ) : (
    <QForm questionnaire={questionnaire} qrResponse={questionnaireResponse} />
  );

  return (
    <div>
      <NavBar patient={patient} />
      {renderQPage}
    </div>
  );
}

export default QPage;
