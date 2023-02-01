/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useContext, useEffect, useState } from 'react';
import { QuestionnaireResponse } from 'fhir/r5';
import { removeNoAnswerQrItem } from '../../functions/QrItemFunctions';
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

    const qrFormClean = removeNoAnswerQrItem(updatedQResponse.item[0]);
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
