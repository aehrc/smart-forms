import React, { useEffect, useState } from 'react';
import ProgressSpinner from './ProgressSpinner';
import { createQuestionnaireResponse } from '../../functions/QrItemFunctions';
import EnableWhenContextProvider from '../../custom-contexts/EnableWhenContext';
import { populate } from '../../functions/PrepopulateFunctions';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../App';
import QForm from './QForm';

function QRenderer() {
  const questionnaireProvider = React.useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = React.useContext(QuestionnaireResponseProviderContext);
  const launch = React.useContext(LaunchContext);

  const questionnaire = questionnaireProvider.questionnaire;
  if (!questionnaire.item) return null;

  if (!questionnaireResponseProvider.questionnaireResponse.item) {
    questionnaireResponseProvider.setQuestionnaireResponse(
      createQuestionnaireResponse(questionnaire.id, questionnaire.item[0])
    );
  }

  const [spinner, setSpinner] = useState({
    isLoading: true,
    message: 'Loading questionnaire form'
  });

  useEffect(() => {
    const client = launch.fhirClient;
    const patient = launch.patient;
    if (!client || !patient) {
      setSpinner({ ...spinner, isLoading: false });
      return;
    }

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
  }, []);

  const RenderQPage = () => {
    if (spinner.isLoading) {
      return <ProgressSpinner message={spinner.message} />;
    } else {
      return (
        <EnableWhenContextProvider>
          <QForm />
        </EnableWhenContextProvider>
      );
    }
  };

  return <RenderQPage />;
}

export default QRenderer;
