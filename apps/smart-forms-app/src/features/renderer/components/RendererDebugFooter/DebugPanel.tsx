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
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import type { Questionnaire, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { RoundButton } from '../../../../components/Button/Button.styles.tsx';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import NotesIcon from '@mui/icons-material/Notes';
import DebugResponseView from './DebugResponseView.tsx';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const endpointUrl = import.meta.env.VITE_FORMS_SERVER_URL ?? 'https://smartforms.csiro.au/api/fhir';

interface Props {
  questionnaire: Questionnaire;
  questionnaireResponse: QuestionnaireResponse;
  questionnaireResponseItems: Record<string, QuestionnaireResponseItem[]>;
  fhirPathContext: Record<string, any>;
  populatedContext: Record<string, any>;
  clearQResponse: () => unknown;
}

function DebugPanel(props: Props) {
  const {
    questionnaire,
    questionnaireResponse,
    questionnaireResponseItems,
    fhirPathContext,
    populatedContext,
    clearQResponse
  } = props;

  const [displayName, setDisplayName] = useState('Questionnaire Response');
  const [showJsonTree, setShowJsonTree] = useState(false);

  const displayObject =
    {
      Questionnaire: questionnaire,
      'Questionnaire Response': questionnaireResponse,
      'Questionnaire Response items': questionnaireResponseItems,
      'FHIRPath variables': fhirPathContext,
      'Populated variables/context': populatedContext
    }[displayName] || null;

  const questionnaireSelected = displayName === 'Questionnaire';
  const questionnaireResponseSelected = displayName === 'Questionnaire Response';
  const questionnaireResponseItemsSelected = displayName === 'Questionnaire Response items';
  const fhirPathContextSelected = displayName === 'FHIRPath variables';
  const populatedContextSelected = displayName === 'Populated variables/context';

  return (
    <Stack sx={{ pt: 6 }}>
      <Stack direction="row" justifyContent="space-between">
        <Stack direction="row" alignItems="center">
          <Typography variant="h5">{displayName}</Typography>
          <Tooltip title={showJsonTree ? 'Toggle text view' : 'Toggle JSON tree view'}>
            <IconButton
              onClick={() => {
                setShowJsonTree(!showJsonTree);
              }}>
              {showJsonTree ? <NotesIcon /> : <AccountTreeIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy to clipboard">
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
          </Tooltip>
          {questionnaireSelected ? (
            <Tooltip title="Open Questionnaire in new tab">
              <a
                href={endpointUrl + '/Questionnaire/' + questionnaire.id}
                target="_blank"
                rel="noreferrer">
                <IconButton>
                  <OpenInNewIcon />
                </IconButton>
              </a>
            </Tooltip>
          ) : null}
          {questionnaireResponseSelected ? (
            <Tooltip title="Clear response">
              <IconButton onClick={clearQResponse} color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
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
          disabled={questionnaireResponseItemsSelected}
          onClick={() => setDisplayName('Questionnaire Response items')}>
          QR Items
        </RoundButton>
        <RoundButton
          variant="outlined"
          disabled={fhirPathContextSelected}
          onClick={() => setDisplayName('FHIRPath variables')}>
          FHIRPath variables
        </RoundButton>
        <RoundButton
          variant="outlined"
          disabled={populatedContextSelected}
          onClick={() => setDisplayName('Populated variables/context')}>
          Populated variables
        </RoundButton>
      </Box>

      <Box p={1}>
        <Typography color="text.secondary" pb={1}>
          {showJsonTree
            ? 'Use JSON Tree for selective debugging. For more detailed debugging, copy tree nodes to a text editor.'
            : 'Use text view for fast Ctrl+F debugging.'}
        </Typography>
        <DebugResponseView displayObject={displayObject} showJsonTree={showJsonTree} />
      </Box>
    </Stack>
  );
}

export default DebugPanel;
