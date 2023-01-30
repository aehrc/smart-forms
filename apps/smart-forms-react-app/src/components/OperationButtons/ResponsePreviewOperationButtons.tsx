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
import BackToPickerButton from './SingleButtons/BackToPickerButton';
import EditResponseButton from './SingleButtons/EditResponseButton';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../App';
import SaveAsFinalButton from './SingleButtons/SaveAsFinalButton';
import { QuestionnaireSource } from '../../interfaces/Enums';
import { LaunchContext } from '../../custom-contexts/LaunchContext';

interface Props {
  isChip?: boolean;
}

function ResponsePreviewOperationButtons(props: Props) {
  const { isChip } = props;
  const questionnaireResponseProvider = useContext(QuestionnaireResponseProviderContext);
  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const launch = useContext(LaunchContext);
  return (
    <>
      <BackToPickerButton isChip={isChip} />
      {questionnaireResponseProvider.questionnaireResponse.status === 'completed' ? null : (
        <EditResponseButton isChip={isChip} />
      )}

      {launch.fhirClient &&
      launch.user &&
      launch.patient &&
      questionnaireProvider.source === QuestionnaireSource.Remote &&
      questionnaireResponseProvider.questionnaireResponse.status !== 'completed' ? (
        <SaveAsFinalButton
          isChip={isChip}
          questionnaireResponse={questionnaireResponseProvider.questionnaireResponse}
          fhirClient={launch.fhirClient}
          patient={launch.patient}
          user={launch.user}
          removeQrHasChanges={() => ({})}
        />
      ) : null}
    </>
  );
}

export default ResponsePreviewOperationButtons;
