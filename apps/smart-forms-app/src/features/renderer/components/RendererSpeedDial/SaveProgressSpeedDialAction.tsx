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

import type { SpeedDialActionProps } from '@mui/material';
import { IconButton, SpeedDialAction, Tooltip } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import SaveIcon from '@mui/icons-material/Save';
import cloneDeep from 'lodash.clonedeep';
import {
  removeHiddenAnswersFromResponse,
  useQuestionnaireResponseStore,
  useQuestionnaireStore
} from '@aehrc/smart-forms-renderer';
import { saveQuestionnaireResponse } from '../../../../api/saveQr.ts';
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import useSmartClient from '../../../../hooks/useSmartClient.ts';

function SaveProgressSpeedDialAction(props: SpeedDialActionProps) {
  const { smartClient, patient, user, launchQuestionnaire } = useSmartClient();

  const sourceQuestionnaire = useQuestionnaireStore((state) => state.sourceQuestionnaire);
  const updatableResponse = useQuestionnaireResponseStore((state) => state.updatableResponse);
  const setUpdatableResponseAsSaved = useQuestionnaireResponseStore(
    (state) => state.setUpdatableResponseAsSaved
  );

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const navigate = useNavigate();

  function handleSaveAsDraft() {
    if (!(smartClient && patient && user)) {
      return;
    }

    let responseToSave = cloneDeep(updatableResponse);

    responseToSave = removeHiddenAnswersFromResponse(sourceQuestionnaire, responseToSave);

    responseToSave.status = 'in-progress';
    saveQuestionnaireResponse(smartClient, patient, user, sourceQuestionnaire, responseToSave)
      .then((savedResponse) => {
        setUpdatableResponseAsSaved(savedResponse);
        enqueueSnackbar('Response saved', {
          variant: 'success',
          action: (
            <Tooltip title="View Responses" color="inherit">
              <IconButton
                onClick={() => {
                  navigate(launchQuestionnaire ? '/dashboard/existing' : '/dashboard/responses');
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

  const buttonDisabled = !(smartClient && sourceQuestionnaire.item);

  if (buttonDisabled) {
    return null;
  }

  return (
    <SpeedDialAction
      icon={<SaveIcon />}
      tooltipTitle={'Save Progress'}
      tooltipOpen
      onClick={handleSaveAsDraft}
      {...props}
    />
  );
}

export default SaveProgressSpeedDialAction;
