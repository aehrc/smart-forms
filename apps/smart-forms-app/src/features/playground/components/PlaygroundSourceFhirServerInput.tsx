/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 10.59 230.
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

import { IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { verifyFhirServer } from '../api/verifyFhirServer.ts';
import VerifiedIcon from '@mui/icons-material/Verified';
import ErrorIcon from '@mui/icons-material/Error';

interface PlaygroundSourceFhirServerInputProps {
  fhirServerUrlInput: string;
  fhirServerUrlInputValid: boolean | 'unchecked';
  onFhirServerUrlInputChange: (endpointUrl: string) => void;
  onValidateFhirServerUrlInput: (isValid: boolean | 'unchecked') => void;
}

function PlaygroundSourceFhirServerInput(props: PlaygroundSourceFhirServerInputProps) {
  const {
    fhirServerUrlInput,
    fhirServerUrlInputValid,
    onFhirServerUrlInputChange,
    onValidateFhirServerUrlInput
  } = props;

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    onFhirServerUrlInputChange(event.target.value);
    onValidateFhirServerUrlInput('unchecked');
    setFeedbackMessage('URL unvalidated. Click on the question mark to validate.');
  }

  async function handleVerifyFHIRServer() {
    setFeedbackMessage('Validating URL...');
    const { isValidFhirServer, feedbackMessage } = await verifyFhirServer(fhirServerUrlInput);

    if (isValidFhirServer) {
      onValidateFhirServerUrlInput(true);
      setFeedbackMessage('URL validated');
      return;
    }

    // URL not valid
    onValidateFhirServerUrlInput(false);
    setFeedbackMessage(feedbackMessage.slice(0, 1).toUpperCase() + feedbackMessage.slice(1));
  }

  return (
    <Stack justifyContent="left" gap={0.5}>
      <Typography variant="subtitle2" color="text.secondary">
        Source FHIR Server URL
      </Typography>
      <TextField
        value={fhirServerUrlInput}
        onChange={handleInputChange}
        size="small"
        error={fhirServerUrlInputValid === false}
        helperText={feedbackMessage ?? ''}
        fullWidth
        sx={{ minWidth: 350 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {fhirServerUrlInputValid === true ? (
                <VerifiedIcon color="success" fontSize="small" />
              ) : null}

              {fhirServerUrlInputValid === false ? (
                <ErrorIcon color="error" fontSize="small" />
              ) : null}

              {fhirServerUrlInputValid === 'unchecked' ? (
                <Tooltip title="Validate URL">
                  <IconButton onClick={handleVerifyFHIRServer}>
                    <QuestionMarkIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ) : null}
            </InputAdornment>
          )
        }}
      />
    </Stack>
  );
}

export default PlaygroundSourceFhirServerInput;
