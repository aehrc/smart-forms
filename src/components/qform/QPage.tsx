import React, { useEffect, useState } from 'react';
import QForm from './QForm';
import ProgressSpinner from './ProgressSpinner';
import NavBar from '../NavBar';
import { oauth2 } from 'fhirclient';
import { getPatient, getUser } from './functions/LaunchFunctions';
import { Bundle, Patient, Practitioner, QuestionnaireResponse } from 'fhir/r5';
import FhirClient from '../FhirClient';
import { QuestionnaireProvider } from './QuestionnaireProvider';
import { createQuestionnaireResponse } from './functions/QrItemFunctions';
import EnableWhenProvider from './functions/EnableWhenContext';

const questionnaireProvider = new QuestionnaireProvider();
questionnaireProvider.readCalculatedExpressionsAndEnableWhenItems();
questionnaireProvider.readVariables();

function QPage() {
  const questionnaire = questionnaireProvider.questionnaire;
  if (!questionnaire.item) return null;

  const [questionnaireResponse, setQuestionnaireResponse] = useState<QuestionnaireResponse>(
    createQuestionnaireResponse(questionnaire.item[0])
  );
  const [batchResponse, setBatchResponse] = useState<Bundle | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [user, setUser] = useState<Practitioner | null>(null);
  const [fhirClient, setFhirClient] = useState<FhirClient | null>(null);
  const [spinner, setSpinner] = useState({
    isLoading: true,
    message: 'Retrieving patient'
  });

  useEffect(() => {
    oauth2
      .ready()
      .then((client) => {
        const fhirclient = new FhirClient(client);
        setFhirClient(fhirclient);

        // request patient details
        getPatient(client)
          .then((patient) => {
            setPatient(patient);
            setSpinner({ ...spinner, message: 'Loading questionnaire form' });

            // obtain questionnaireResponse for prepopulation
            fhirclient.populate(questionnaire, patient, (qResponse, batchResponse) => {
              setQuestionnaireResponse(qResponse);
              setBatchResponse(batchResponse);
              setSpinner({ ...spinner, isLoading: false });
            });
          })
          .catch((error) => {
            console.error(error);
            setSpinner({ ...spinner, isLoading: false });
          });

        // request user details
        getUser(client)
          .then((user) => {
            setUser(user);
          })
          .catch((error) => console.log(error));
      })
      .catch((error) => {
        console.error(error);
        setSpinner({ ...spinner, isLoading: false });
      });
  }, []);

  const renderQPage = spinner.isLoading ? (
    <ProgressSpinner message={spinner.message} />
  ) : (
    <EnableWhenProvider>
      <QForm
        questionnaireProvider={questionnaireProvider}
        qrResponse={questionnaireResponse}
        batchResponse={batchResponse}
        fhirClient={fhirClient}
      />
    </EnableWhenProvider>
  );

  return (
    <div>
      <NavBar patient={patient} user={user} />
      {renderQPage}
    </div>
  );
}

export default QPage;
