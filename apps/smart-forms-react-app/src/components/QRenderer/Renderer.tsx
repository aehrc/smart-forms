import React, { useContext, useEffect, useState } from 'react';
import ProgressSpinner from '../ProgressSpinner';
import { createQuestionnaireResponse } from '../../functions/QrItemFunctions';
import EnableWhenContextProvider from '../../custom-contexts/EnableWhenContext';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../App';
import RendererBody from './RendererBody';
import { populateQuestionnaire } from '../../functions/populate-functions/PrepopulateFunctions';

function Renderer() {
  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = useContext(QuestionnaireResponseProviderContext);
  const launch = useContext(LaunchContext);

  const questionnaire = questionnaireProvider.questionnaire;
  if (!questionnaire.item) return null;

  if (!questionnaireResponseProvider.questionnaireResponse.item) {
    questionnaireResponseProvider.setQuestionnaireResponse(
      createQuestionnaireResponse(questionnaire.id, questionnaire.item[0])
    );
  }

  const [spinner, setSpinner] = useState({
    isLoading: true,
    message: 'Populating questionnaire form'
  });

  useEffect(() => {
    const client = launch.fhirClient;
    const patient = launch.patient;
    const user = launch.user;
    if (!client || !patient || !user) {
      setSpinner({ ...spinner, isLoading: false });
      return;
    }

    const qrFormItem = questionnaireResponseProvider.questionnaireResponse.item?.[0].item;

    // if questionnaire has a contained attribute OR questionnaireResponse does not have a form item
    if (
      (questionnaire.contained || questionnaire.extension) &&
      (!qrFormItem || qrFormItem.length === 0)
    ) {
      // obtain questionnaireResponse for pre-population
      populateQuestionnaire(
        client,
        questionnaire,
        patient,
        user,
        (qResponse) => {
          questionnaireResponseProvider.setQuestionnaireResponse(qResponse);
          setSpinner({ ...spinner, isLoading: false });
        },
        () => {
          setSpinner({ ...spinner, isLoading: false });
          console.warn('Population failed');
          // TODO popup questionnaire fail to populate
        }
      );
    } else {
      setSpinner({ ...spinner, isLoading: false });
    }
  }, []);

  const RenderPage = () => {
    if (spinner.isLoading) {
      return <ProgressSpinner message={spinner.message} />;
    } else {
      return (
        <EnableWhenContextProvider>
          <RendererBody />
        </EnableWhenContextProvider>
      );
    }
  };

  return <RenderPage />;
}

export default Renderer;
