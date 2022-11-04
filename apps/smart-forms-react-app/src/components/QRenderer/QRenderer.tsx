import React, { useEffect, useState } from 'react';
import QForm from './QForm';
import ProgressSpinner from './ProgressSpinner';
import NavBar from '../NavBar/NavBar';
import { getPatient, getUser } from '../../functions/LaunchFunctions';
import { Patient, Practitioner } from 'fhir/r5';
import { QuestionnaireProvider } from '../../classes/QuestionnaireProvider';
import { createQuestionnaireResponse } from '../../functions/QrItemFunctions';
import EnableWhenProvider from '../../custom-contexts/EnableWhenContext';
import { Container } from '@mui/material';
import QTitle from './QTitle';
import { populate } from '../../functions/PrepopulateFunctions';
import { FhirClientContext } from '../../custom-contexts/FhirClientContext';
import NoQuestionnaireErrorPage from '../ErrorPages/NoQuestionnaireErrorPage';
import { QuestionnaireResponseProvider } from '../../classes/QuestionnaireResponseProvider';
import PreviewFromRenderer from '../Preview/PreviewFromRenderer';

interface Props {
  questionnaireProvider: QuestionnaireProvider;
  questionnaireResponseProvider: QuestionnaireResponseProvider;
}

function QRenderer(props: Props) {
  const { questionnaireProvider, questionnaireResponseProvider } = props;
  const fhirClientContext = React.useContext(FhirClientContext);

  const questionnaire = questionnaireProvider.questionnaire;
  if (!questionnaire.item) {
    return <NoQuestionnaireErrorPage />;
  }

  if (!questionnaireResponseProvider.questionnaireResponse.item) {
    questionnaireResponseProvider.setQuestionnaireResponse(
      createQuestionnaireResponse(questionnaire.id, questionnaire.item[0])
    );
  }

  const [patient, setPatient] = useState<Patient | null>(null);
  const [user, setUser] = useState<Practitioner | null>(null);
  const [spinner, setSpinner] = useState({
    isLoading: true,
    message: patient ? 'Loading questionnaire form' : 'Retrieving patient'
  });
  const [previewMode, setPreviewMode] = useState(false);

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

        const qrFormItem = questionnaireResponseProvider.questionnaireResponse.item?.[0].item;

        // if questionnaire has a contained attribute OR questionnaireResponse does not have a form item
        if (questionnaire.contained && (!qrFormItem || qrFormItem.length === 0)) {
          // obtain questionnaireResponse for prepopulation
          populate(client, questionnaire, patient, (qResponse, batchResponse) => {
            questionnaireResponseProvider.setQuestionnaireResponse(qResponse);
            questionnaireResponseProvider.setBatchResponse(batchResponse);
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

  const RenderQPage = () => {
    if (spinner.isLoading) {
      return <ProgressSpinner message={spinner.message} />;
    } else if (previewMode) {
      return (
        <PreviewFromRenderer
          questionnaireProvider={questionnaireProvider}
          questionnaireResponseProvider={questionnaireResponseProvider}
          setPreviewMode={() => setPreviewMode(!previewMode)}
        />
      );
    } else {
      return (
        <EnableWhenProvider>
          <Container maxWidth="lg">
            <QTitle questionnaire={questionnaire} />
            <QForm
              questionnaireProvider={questionnaireProvider}
              questionnaireResponseProvider={questionnaireResponseProvider}
              setPreviewMode={() => setPreviewMode(!previewMode)}
            />
          </Container>
        </EnableWhenProvider>
      );
    }
  };

  return (
    <>
      <NavBar patient={patient} user={user} />
      <RenderQPage />
    </>
  );
}

export default QRenderer;
