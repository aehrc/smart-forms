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

import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import GradingIcon from '@mui/icons-material/Grading';
import useFetchExistingResponses from '../../../../hooks/useFetchExistingResponses.ts';
import useSelectedQuestionnaire from '../../../../hooks/useSelectedQuestionnaire.ts';
import CloseSnackbar from '../../../../../../components/Snackbar/CloseSnackbar.tsx';

function ViewExistingResponsesButton() {
  const { selectedQuestionnaire, setExistingResponses } = useSelectedQuestionnaire();

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const { existingResponses, fetchError, isFetching } = useFetchExistingResponses();

  if (fetchError) {
    console.error(fetchError);
    enqueueSnackbar('An error occurred while fetching existing responses', {
      variant: 'error',
      preventDuplicate: true,
      action: <CloseSnackbar />
    });
  }

  function handleClick() {
    setExistingResponses(existingResponses);
    navigate('/dashboard/responses');
  }

  let responseMessage;
  if (isFetching && selectedQuestionnaire) {
    responseMessage = 'Loading responses';
  } else if (existingResponses.length === 0) {
    responseMessage = 'No responses found';
  } else {
    responseMessage = 'View responses';
  }

  const buttonIsDisabled = !selectedQuestionnaire || existingResponses.length === 0 || isFetching;

  return (
    <Stack alignItems="center" width={85}>
      <IconButton
        disabled={buttonIsDisabled}
        color="primary"
        onClick={handleClick}
        data-test="button-view-responses">
        {isFetching && selectedQuestionnaire ? (
          <CircularProgress size={20} color="inherit" sx={{ mb: 0.5 }} />
        ) : existingResponses.length === 0 ? (
          <HighlightOffIcon />
        ) : (
          <GradingIcon />
        )}
      </IconButton>

      <Typography
        fontSize={8.25}
        variant="subtitle2"
        color={buttonIsDisabled ? 'text.disabled' : 'primary'}
        textAlign="center"
        sx={{ mt: -0.5, mb: 0.5 }}>
        {responseMessage}
      </Typography>
    </Stack>
  );
}

export default ViewExistingResponsesButton;
