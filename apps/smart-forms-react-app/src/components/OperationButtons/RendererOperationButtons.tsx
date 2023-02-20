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

import React, { useContext } from 'react';
import ChangeQuestionnaireButton from './SingleButtons/ChangeQuestionnaireButton';
import SaveAsDraftButton from './SingleButtons/SaveAsDraftButton';
import SaveAsFinalButton from './SingleButtons/SaveAsFinalButton';
import { QuestionnaireResponse } from 'fhir/r5';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import ViewFormPreviewButton from './SingleButtons/ViewFormPreviewButton';
import { QuestionnaireProviderContext } from '../../App';
import { QuestionnaireSource } from '../../interfaces/Enums';

interface Props {
  isChip?: boolean;
  qrHasChanges: boolean;
  removeQrHasChanges: () => unknown;
  togglePreviewMode: () => unknown;
  questionnaireResponse: QuestionnaireResponse;
}

function RendererOperationButtons(props: Props) {
  const { isChip, qrHasChanges, removeQrHasChanges, togglePreviewMode, questionnaireResponse } =
    props;

  const { fhirClient, patient, user } = useContext(LaunchContext);
  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  return (
    <>
      <ChangeQuestionnaireButton
        isChip={isChip}
        qrHasChanges={qrHasChanges}
        removeQrHasChanges={removeQrHasChanges}
        questionnaireResponse={questionnaireResponse}
      />
      <ViewFormPreviewButton isChip={isChip} togglePreviewMode={togglePreviewMode} />
      {fhirClient &&
      user &&
      patient &&
      questionnaireProvider.source === QuestionnaireSource.Remote ? (
        <>
          <SaveAsDraftButton
            isChip={isChip}
            qrHasChanges={qrHasChanges}
            removeQrHasChanges={removeQrHasChanges}
            questionnaireResponse={questionnaireResponse}
            fhirClient={fhirClient}
            patient={patient}
            user={user}
          />
          <SaveAsFinalButton
            isChip={isChip}
            qrHasChanges={qrHasChanges}
            removeQrHasChanges={removeQrHasChanges}
            questionnaireResponse={questionnaireResponse}
            fhirClient={fhirClient}
            patient={patient}
            user={user}
          />
        </>
      ) : null}
    </>
  );
}

export default RendererOperationButtons;
