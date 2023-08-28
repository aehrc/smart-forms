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
import { useEffect, useState } from 'react';
import { removeHiddenAnswers, saveQuestionnaireResponse } from '../../../../save/api/saveQr.ts';
import { RendererOperationItem } from '../RendererOperationSection.tsx';
import { useSnackbar } from 'notistack';
import cloneDeep from 'lodash.clonedeep';
import useConfigStore from '../../../../../stores/useConfigStore.ts';
import useQuestionnaireStore from '../../../../../stores/useQuestionnaireStore.ts';
import useQuestionnaireResponseStore from '../../../../../stores/useQuestionnaireResponseStore.ts';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { IconButton, Tooltip } from '@mui/material';
import ReadMoreIcon from '@mui/icons-material/ReadMore';

function RendererSaveAsDraft() {
  const smartClient = useConfigStore((state) => state.smartClient);
  const patient = useConfigStore((state) => state.patient);
  const user = useConfigStore((state) => state.user);

  const sourceQuestionnaire = useQuestionnaireStore((state) => state.sourceQuestionnaire);
  const enableWhenIsActivated = useQuestionnaireStore((state) => state.enableWhenIsActivated);
  const enableWhenItems = useQuestionnaireStore((state) => state.enableWhenItems);
  const enableWhenExpressions = useQuestionnaireStore((state) => state.enableWhenExpressions);

  const updatableResponse = useQuestionnaireResponseStore((state) => state.updatableResponse);
  const saveResponse = useQuestionnaireResponseStore((state) => state.saveResponse);
  const hasChanges = useQuestionnaireResponseStore((state) => state.saveResponse);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [isUpdating, setIsUpdating] = useState(false);

  const navigate: NavigateFunction = useNavigate();
  useEffect(() => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
    }, 800);
  }, [updatableResponse]);

  const buttonIsDisabled = !smartClient || !hasChanges || isUpdating;

  function handleClick() {
    closeSnackbar();
    if (!(smartClient && patient && user)) {
      return;
    }

    let responseToSave = cloneDeep(updatableResponse);
    responseToSave = removeHiddenAnswers({
      questionnaire: sourceQuestionnaire,
      questionnaireResponse: responseToSave,
      enableWhenIsActivated,
      enableWhenItems,
      enableWhenExpressions
    });

    responseToSave.status = 'in-progress';
    saveQuestionnaireResponse(smartClient, patient, user, sourceQuestionnaire, responseToSave)
      .then((savedResponse) => {
        saveResponse(savedResponse);
        enqueueSnackbar('Response saved as draft', {
          variant: 'success',
          action: (
            <Tooltip title="View Responses">
              <IconButton
                color="inherit"
                onClick={() => {
                  navigate('/dashboard/responses');
                  closeSnackbar();
                }}>
                <ReadMoreIcon />
              </IconButton>
            </Tooltip>
          )
        });
      })
      .catch((error) => {
        console.error(error);
        enqueueSnackbar('An error occurred while saving. Try again later.', {
          variant: 'error'
        });
      });
  }

  return (
    <RendererOperationItem
      title={'Save as Draft'}
      icon={<SaveIcon />}
      disabled={buttonIsDisabled}
      onClick={handleClick}
    />
  );
}

export default RendererSaveAsDraft;
