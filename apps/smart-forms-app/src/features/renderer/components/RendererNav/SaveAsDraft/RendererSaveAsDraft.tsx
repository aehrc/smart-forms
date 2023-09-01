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
import { saveQuestionnaireResponse } from '../../../../save/api/saveQr.ts';
import { RendererOperationItem } from '../RendererOperationSection.tsx';
import { useSnackbar } from 'notistack';
import cloneDeep from 'lodash.clonedeep';
import type { NavigateFunction } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { IconButton, Tooltip } from '@mui/material';
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import {
  removeHiddenAnswersFromResponse,
  useQuestionnaireResponseStore,
  useQuestionnaireStore
} from '@aehrc/smart-forms-renderer';
import useSmartClient from '../../../../../hooks/useSmartClient.ts';

function RendererSaveAsDraft() {
  const { smartClient, patient, user, launchQuestionnaire } = useSmartClient();

  const sourceQuestionnaire = useQuestionnaireStore((state) => state.sourceQuestionnaire);
  const updatableResponse = useQuestionnaireResponseStore((state) => state.updatableResponse);
  const hasChanges = useQuestionnaireResponseStore((state) => state.hasChanges);
  const setUpdatableResponseAsSaved = useQuestionnaireResponseStore(
    (state) => state.setUpdatableResponseAsSaved
  );

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
  const launchQuestionnaireExists = !!launchQuestionnaire;

  function handleClick() {
    closeSnackbar();
    if (!(smartClient && patient && user)) {
      return;
    }

    const responseToSave = removeHiddenAnswersFromResponse(
      sourceQuestionnaire,
      cloneDeep(updatableResponse)
    );

    responseToSave.status = 'in-progress';
    saveQuestionnaireResponse(smartClient, patient, user, sourceQuestionnaire, responseToSave)
      .then((savedResponse) => {
        setUpdatableResponseAsSaved(savedResponse);
        enqueueSnackbar('Response saved as draft', {
          variant: 'success',
          action: (
            <Tooltip title="View Responses">
              <IconButton
                color="inherit"
                onClick={() => {
                  navigate(
                    launchQuestionnaireExists ? '/dashboard/existing' : '/dashboard/responses'
                  );
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
