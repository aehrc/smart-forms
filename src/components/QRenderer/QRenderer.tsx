import React, { useEffect, useState } from 'react';
import ProgressSpinner from './ProgressSpinner';
import { QuestionnaireProvider } from '../../classes/QuestionnaireProvider';
import { createQuestionnaireResponse } from '../../functions/QrItemFunctions';
import EnableWhenContextProvider from '../../custom-contexts/EnableWhenContext';
import { populate } from '../../functions/PrepopulateFunctions';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import { QuestionnaireResponseProvider } from '../../classes/QuestionnaireResponseProvider';
import PreviewFromRenderer from '../Preview/PreviewFromRenderer';
import QLayout from './QLayout';
import { PreviewModeContext } from '../../custom-contexts/PreviewModeContext';

interface Props {
  questionnaireProvider: QuestionnaireProvider;
  questionnaireResponseProvider: QuestionnaireResponseProvider;
}

function QRenderer(props: Props) {
  const { questionnaireProvider, questionnaireResponseProvider } = props;
  const launchContext = React.useContext(LaunchContext);
  const previewModeContext = React.useContext(PreviewModeContext);

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
    const client = launchContext.fhirClient;
    const patient = launchContext.patient;
    if (!client || !patient) {
      setSpinner({ ...spinner, isLoading: false });
      return;
    }

    const qrFormItem = questionnaireResponseProvider.questionnaireResponse.item;

    // if questionnaire has a contained attribute OR questionnaireResponse does not have a form item
    if (questionnaire.contained && !qrFormItem) {
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
    } else if (previewModeContext.previewMode) {
      return (
        <PreviewFromRenderer
          questionnaireProvider={questionnaireProvider}
          questionnaireResponseProvider={questionnaireResponseProvider}
        />
      );
    } else {
      return (
        <EnableWhenContextProvider>
          <QLayout
            questionnaireProvider={questionnaireProvider}
            questionnaireResponseProvider={questionnaireResponseProvider}
          />
          {/*<Grid>*/}
          {/*  <Grid item xs={5}>*/}
          {/*    <QList></QList>*/}
          {/*  </Grid>*/}
          {/*  <Grid item xs={7}>*/}
          {/*    <QList></QList>*/}
          {/*  </Grid>*/}
          {/*</Grid>*/}

          {/*<Container maxWidth="lg">*/}
          {/*  <QTitle questionnaire={questionnaire} />*/}
          {/*  <QForm*/}
          {/*    questionnaireProvider={questionnaireProvider}*/}
          {/*    questionnaireResponseProvider={questionnaireResponseProvider}*/}
          {/*    setPreviewMode={() => setPreviewMode(!previewMode)}*/}
          {/*  />*/}
          {/*</Container>*/}
        </EnableWhenContextProvider>
      );
    }
  };

  return <RenderQPage />;
}

export default QRenderer;
