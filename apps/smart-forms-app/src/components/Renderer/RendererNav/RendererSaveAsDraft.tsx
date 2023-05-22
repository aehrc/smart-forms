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

import SaveIcon from '@mui/icons-material/Save';
import { useContext, useEffect, useState } from 'react';
import { removeHiddenAnswers, saveQuestionnaireResponse } from '../../../functions/SaveQrFunctions';
import { SmartAppLaunchContext } from '../../../custom-contexts/SmartAppLaunchContext.tsx';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../../App';
import { RendererContext } from '../RendererLayout';
import { EnableWhenContext } from '../../../custom-contexts/EnableWhenContext';
import { OperationItem } from './RendererOperationSection';
import { useSnackbar } from 'notistack';
import cloneDeep from 'lodash.clonedeep';

function RendererSaveAsDraft() {
  const { fhirClient, patient, user } = useContext(SmartAppLaunchContext);
  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const responseProvider = useContext(QuestionnaireResponseProviderContext);
  const { renderer, setRenderer } = useContext(RendererContext);
  const enableWhenContext = useContext(EnableWhenContext);

  const { response, hasChanges } = renderer;

  const { enqueueSnackbar } = useSnackbar();

  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
    }, 500);
  }, [response]);

  return (
    <OperationItem
      title={'Save as Draft'}
      icon={<SaveIcon />}
      disabled={!hasChanges || !fhirClient || isUpdating}
      onClick={() => {
        if (!(fhirClient && patient && user)) return;

        let responseToSave = cloneDeep(response);
        responseToSave = removeHiddenAnswers(
          questionnaireProvider.questionnaire,
          responseToSave,
          enableWhenContext
        );

        responseToSave.status = 'in-progress';
        saveQuestionnaireResponse(
          fhirClient,
          patient,
          user,
          questionnaireProvider.questionnaire,
          responseToSave
        )
          .then((savedResponse) => {
            responseProvider.setQuestionnaireResponse(savedResponse);
            setRenderer({ response: savedResponse, hasChanges: false });
            enqueueSnackbar('Response saved as draft', { variant: 'success' });
          })
          .catch((error) => {
            console.error(error);
            enqueueSnackbar('An error occurred while saving. Try again later.', {
              variant: 'error'
            });
          });
      }}
    />
  );
}

export default RendererSaveAsDraft;
