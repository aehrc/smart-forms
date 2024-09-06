/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postQuestionnaireToSMARTHealthIT } from '../../../../../../api/saveQr.ts';
import { CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote';
import useSmartClient from '../../../../../../hooks/useSmartClient.ts';
import useSelectedQuestionnaire from '../../../../hooks/useSelectedQuestionnaire.ts';
import { TERMINOLOGY_SERVER_URL } from '../../../../../../globals.ts';
import { buildFormWrapper } from '../../../../../../utils/manageForm.ts';

function CreateNewResponseButton() {
  const { smartClient, launchQuestionnaire } = useSmartClient();

  const { selectedQuestionnaire } = useSelectedQuestionnaire();
  const questionnaire = selectedQuestionnaire ?? launchQuestionnaire;

  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    if (!questionnaire) return;

    setIsLoading(true);

    // Post questionnaire to client if it is SMART Health IT and its variants
    if (smartClient?.state.serverUrl.includes('https://launch.smarthealthit.org/v/r4/fhir')) {
      questionnaire.id = questionnaire.id + '-SMARTcopy';
      postQuestionnaireToSMARTHealthIT(smartClient, questionnaire);
    }

    await buildFormWrapper(questionnaire, undefined, undefined, TERMINOLOGY_SERVER_URL);

    navigate('/renderer');
    setIsLoading(false);
  }

  const buttonIsDisabled = !questionnaire || isLoading;

  return (
    <Stack alignItems="center">
      <IconButton
        disabled={buttonIsDisabled}
        color="secondary"
        onClick={handleClick}
        data-test="button-create-response">
        {isLoading ? (
          <CircularProgress size={20} color="inherit" sx={{ mb: 0.5 }} />
        ) : (
          <EditNoteIcon />
        )}
      </IconButton>

      <Typography
        fontSize={9}
        variant="subtitle2"
        color={buttonIsDisabled ? 'text.disabled' : 'secondary'}
        sx={{ mt: -0.5, mb: 0.5 }}
        textAlign="center">
        Create response
      </Typography>
    </Stack>
  );
}

export default CreateNewResponseButton;
