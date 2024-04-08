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

import { useState } from 'react';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { RoundButton } from '../../../../components/Button/Button.styles.tsx';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import NotesIcon from '@mui/icons-material/Notes';
import DebugResponseView from './DebugResponseView.tsx';

interface Props {
  questionnaire: Questionnaire;
  questionnaireResponse: QuestionnaireResponse;
  fhirPathContext: Record<string, any>;
  clearQResponse: () => unknown;
}

function DebugResponse(props: Props) {
  const { questionnaire, questionnaireResponse, fhirPathContext, clearQResponse } = props;

  const [displayName, setDisplayName] = useState('Questionnaire Response');
  const [showJsonTree, setShowJsonTree] = useState(false);

  const displayObject =
    {
      Questionnaire: questionnaire,
      'Questionnaire Response': questionnaireResponse,
      Variables: fhirPathContext
    }[displayName] || null;

  const questionnaireSelected = displayName === 'Questionnaire';
  const questionnaireResponseSelected = displayName === 'Questionnaire Response';
  const variablesSelected = displayName === 'Variables';

  return (
    <Stack sx={{ pt: 6 }}>
      <Stack direction="row" justifyContent="space-between">
        <Stack direction="row" alignItems="center">
          <Typography variant="h5">{displayName}</Typography>
          <IconButton
            onClick={() => {
              setShowJsonTree(!showJsonTree);
            }}>
            {showJsonTree ? <NotesIcon /> : <AccountTreeIcon />}
          </IconButton>
          <IconButton
            onClick={() => {
              navigator.clipboard
                .writeText(JSON.stringify(displayObject, null, 2))
                .then(() => alert(`${displayName} copied to clipboard`))
                .catch(() =>
                  alert(
                    'The copy operation doesnt work within an iframe (CMS-launched app in this case)\n:('
                  )
                );
            }}>
            <ContentCopyIcon />
          </IconButton>
          {questionnaireResponseSelected ? (
            <IconButton onClick={clearQResponse} color="error">
              <DeleteIcon />
            </IconButton>
          ) : null}
        </Stack>
      </Stack>
      <Box display="flex" columnGap={1}>
        <RoundButton
          variant="outlined"
          disabled={questionnaireSelected}
          onClick={() => setDisplayName('Questionnaire')}>
          Questionnaire
        </RoundButton>
        <RoundButton
          variant="outlined"
          disabled={questionnaireResponseSelected}
          onClick={() => setDisplayName('Questionnaire Response')}>
          QuestionnaireResponse
        </RoundButton>
        <RoundButton
          variant="outlined"
          disabled={variablesSelected}
          onClick={() => setDisplayName('Variables')}>
          Variables
        </RoundButton>
      </Box>

      <Box p={2}>
        <DebugResponseView displayObject={displayObject} showJsonTree={showJsonTree} />
      </Box>
    </Stack>
  );
}

export default DebugResponse;
