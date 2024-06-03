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
import { CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import { buildForm } from '@aehrc/smart-forms-renderer';
import useSelectedQuestionnaire from '../../../../hooks/useSelectedQuestionnaire.ts';
import TerminalIcon from '@mui/icons-material/Terminal';

function GoToSdcIdeButton() {
  const { selectedQuestionnaire } = useSelectedQuestionnaire();
  const questionnaire = selectedQuestionnaire;

  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    if (!questionnaire) return;

    setIsLoading(true);

    await buildForm(questionnaire);

    navigate('/sdc-ide');
    setIsLoading(false);
  }

  const buttonIsDisabled = !questionnaire || isLoading;

  return (
    <Stack alignItems="center">
      <IconButton disabled={buttonIsDisabled} color="info" onClick={handleClick}>
        {isLoading ? (
          <CircularProgress size={20} color="inherit" sx={{ mb: 0.5 }} />
        ) : (
          <TerminalIcon />
        )}
      </IconButton>

      <Typography
        fontSize={9}
        variant="subtitle2"
        color={buttonIsDisabled ? 'text.disabled' : 'info'}
        sx={{ mt: -0.5, mb: 0.5 }}
        textAlign="center">
        Go to SDC IDE
      </Typography>
    </Stack>
  );
}

export default GoToSdcIdeButton;
