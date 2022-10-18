import React, { useEffect, useState } from 'react';
import QForm from './QForm';
import ProgressSpinner from './ProgressSpinner';
import NavBar from '../NavBar/NavBar';
import { getPatient, getUser } from '../../functions/LaunchFunctions';
import { Bundle, Patient, Practitioner, QuestionnaireResponse } from 'fhir/r5';
import { QuestionnaireProvider } from '../../classes/QuestionnaireProvider';
import { createQuestionnaireResponse } from '../../functions/QrItemFunctions';
import EnableWhenProvider from '../../custom-contexts/EnableWhenContext';
import { Container } from '@mui/material';
import QTitle from './QTitle';
import { populate } from '../../functions/PrepopulateFunctions';
import { FhirClientContext } from '../../custom-contexts/FhirClientContext';
import NoQuestionnaireErrorPage from './NoQuestionnaireErrorPage';
import { QuestionnaireResponseProvider } from '../../classes/QuestionnaireResponseProvider';

interface Props {
  questionnaireProvider: QuestionnaireProvider;
  questionnaireResponseProvider: QuestionnaireResponseProvider;
}

function QRenderer(props: Props) {
  const { questionnaireProvider, questionnaireResponseProvider } = props;
  const fhirClientContext = React.useContext(FhirClientContext);

  const questionnaire = questionnaireProvider.questionnaire;
  const qResponse = questionnaireResponseProvider.questionnaireResponse;
  if (!questionnaire.item) {
    return <NoQuestionnaireErrorPage />;
  }

  const [questionnaireResponse, setQuestionnaireResponse] = useState<QuestionnaireResponse>(
    qResponse.item
      ? qResponse
      : createQuestionnaireResponse(questionnaire.id, questionnaire.item[0])
  );
  const [patient, setPatient] = useState<Patient | null>(null);
  const [user, setUser] = useState<Practitioner | null>(null);
  const [batchResponse, setBatchResponse] = useState<Bundle | null>(null);
  const [spinner, setSpinner] = useState({
    isLoading: true,
    message: patient ? 'Loading questionnaire form' : 'Retrieving patient'
  });

  useEffect(() => {
    const client = fhirClientContext.fhirClient;
    if (!client) {
      setSpinner({ ...spinner, isLoading: false });
      return;
    }

    // request patient details
    getPatient(client)
      .then((patient) => {
        setPatient(patient);
        setSpinner({ ...spinner, message: 'Loading questionnaire form' });

        const qrFormItem = questionnaireResponseProvider.questionnaireResponse.item;

        // if questionnaire has a contained attribute OR questionnaireResponse does not have a form item
        if (questionnaire.contained && !qrFormItem) {
          // obtain questionnaireResponse for prepopulation
          populate(client, questionnaire, patient, (qResponse, batchResponse) => {
            setQuestionnaireResponse(qResponse);
            setBatchResponse(batchResponse);
            setSpinner({ ...spinner, isLoading: false });
          });
        } else {
          setSpinner({ ...spinner, isLoading: false });
        }
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
