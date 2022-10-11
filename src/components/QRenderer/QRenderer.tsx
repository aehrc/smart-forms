import React, { useEffect, useState } from 'react';
import QForm from './QForm';
import ProgressSpinner from './ProgressSpinner';
import NavBar from '../NavBar/NavBar';
import { oauth2 } from 'fhirclient';
import { getPatient, getUser } from '../../functions/LaunchFunctions';
import { Bundle, Patient, Practitioner, QuestionnaireResponse } from 'fhir/r5';
import { QuestionnaireProvider } from '../../classes/QuestionnaireProvider';
import { createQuestionnaireResponse } from '../../functions/QrItemFunctions';
import EnableWhenProvider from '../../functions/EnableWhenContext';
import { Container } from '@mui/material';
import QTitle from './QTitle';
import { populate } from '../../functions/PrepopulateFunctions';

interface Props {
  questionnaireProvider: QuestionnaireProvider;
}

function QRenderer(props: Props) {
  const { questionnaireProvider } = props;

  const questionnaire = questionnaireProvider.questionnaire;
  if (!questionnaire.item) return null;

  const [questionnaireResponse, setQuestionnaireResponse] = useState<QuestionnaireResponse>(
    createQuestionnaireResponse(questionnaire.id, questionnaire.item[0])
  );
  const [patient, setPatient] = useState<Patient | null>(null);
  const [user, setUser] = useState<Practitioner | null>(null);
  const [batchResponse, setBatchResponse] = useState<Bundle | null>(null);
  const [spinner, setSpinner] = useState({
    isLoading: true,
    message: patient ? 'Loading questionnaire form' : 'Retrieving patient'
  });

  // Get patient, user and prepopulate form on first render
  useEffect(() => {
    oauth2
      .ready()
      .then((client) => {
        // request patient details
        getPatient(client)
          .then((patient) => {
            setPatient(patient);
            setSpinner({ ...spinner, message: 'Loading questionnaire form' });

            // obtain questionnaireResponse for prepopulation
            populate(client, questionnaire, patient, (qResponse, batchResponse) => {
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
      <Container maxWidth="lg">
        <QTitle questionnaire={questionnaire} />
        <QForm
          questionnaireProvider={questionnaireProvider}
          qrResponse={questionnaireResponse}
          batchResponse={batchResponse}
        />
      </Container>
    </EnableWhenProvider>
  );

  return (
    <>
      <NavBar patient={patient} user={user} />
      {renderQPage}
    </>
  );
}

export default QRenderer;
