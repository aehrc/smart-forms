import React, { useContext, useEffect, useState } from 'react';
import { QuestionnaireResponse } from 'fhir/r5';
import { cleanQrItem } from '../../functions/QrItemFunctions';
import { QuestionnaireResponseProviderContext } from '../../App';
import Form from './Form';
import FormPreview from '../Preview/FormPreview';
import QRSavedSnackbar from './QRSavedSnackbar';

function RendererBody() {
  const questionnaireResponseProvider = useContext(QuestionnaireResponseProviderContext);

  const [questionnaireResponse, setQuestionnaireResponse] = useState<QuestionnaireResponse>(
    questionnaireResponseProvider.questionnaireResponse
  );
  const [qrHasChanges, setQrHasChanges] = useState(false);
  const [tabIndex, setTabIndex] = useState<number | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // update QR state if QR is updated from the server
  // introduces two-way binding
  useEffect(() => {
    const updatedQResponse = questionnaireResponseProvider.questionnaireResponse;
    if (!updatedQResponse.item) return;

    const qrFormClean = cleanQrItem(updatedQResponse.item[0]);
    if (qrFormClean) {
      setQuestionnaireResponse({ ...updatedQResponse, item: [qrFormClean] });
    }
  }, [questionnaireResponseProvider.questionnaireResponse]);

  return (
    <>
      {isPreviewMode ? (
        <FormPreview
          questionnaireResponse={questionnaireResponse}
          qrHasChanges={qrHasChanges}
          removeQrHasChanges={() => setQrHasChanges(false)}
          togglePreviewMode={() => setIsPreviewMode(!isPreviewMode)}
        />
      ) : (
        <Form
          questionnaireResponse={questionnaireResponse}
          tabIndex={tabIndex}
          qrHasChanges={qrHasChanges}
          setTabIndex={(newTabIndex) => setTabIndex(newTabIndex)}
          removeQrHasChanges={() => setQrHasChanges(false)}
          togglePreviewMode={() => setIsPreviewMode(!isPreviewMode)}
          updateQuestionnaireResponse={(newQuestionnaireResponse) => {
            setQuestionnaireResponse(newQuestionnaireResponse);
            setQrHasChanges(true);
          }}
          clearQuestionnaireResponse={(clearedQuestionnaireResponse) => {
            setQuestionnaireResponse(clearedQuestionnaireResponse);
            setQrHasChanges(true);
          }}
        />
      )}
      <QRSavedSnackbar isDisplayed={!qrHasChanges} />
    </>
  );
}

export default RendererBody;
