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

import { useEffect, useState } from 'react';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import type { Bundle, Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { RoundButton } from '../../../../components/Button/Button.styles.tsx';

interface Props {
  questionnaire: Questionnaire;
  questionnaireResponse: QuestionnaireResponse;
  fhirPathContext: Record<string, any>;
  clearQResponse: () => unknown;
}

function DebugResponse(props: Props) {
  const { questionnaire, questionnaireResponse, fhirPathContext, clearQResponse } = props;

  const [displayInfo, setDisplayInfo] = useState<{
    name: string;
    data: Questionnaire | QuestionnaireResponse | Bundle | Record<string, any>;
  }>({ name: 'Questionnaire Response', data: questionnaireResponse });

  useEffect(
    () => {
      if (displayInfo.name === 'Questionnaire Response') {
        setDisplayInfo({ ...displayInfo, data: questionnaireResponse });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [questionnaireResponse]
  );

  return (
    <Box sx={{ pt: 6 }}>
      <Stack direction="row" justifyContent="space-between">
        <Stack direction="row">
          <Typography variant="h5">{displayInfo.name}</Typography>
          <IconButton
            onClick={() => {
              navigator.clipboard
                .writeText(JSON.stringify(displayInfo.data, null, 2))
                .then(() => alert(`${displayInfo.name} copied to clipboard`))
                .catch(() =>
                  alert(
                    'The copy operation doesnt work within an iframe (CMS-launched app in this case)\n:('
                  )
                );
            }}>
            <ContentCopyIcon />
          </IconButton>
          {displayInfo.name === 'Questionnaire Response' ? (
            <IconButton onClick={clearQResponse} color="error">
              <DeleteIcon />
            </IconButton>
          ) : null}
        </Stack>
        <Box display="flex" columnGap={1}>
          <RoundButton
            variant="outlined"
            disabled={displayInfo.name === 'Questionnaire'}
            onClick={() => setDisplayInfo({ name: 'Questionnaire', data: questionnaire })}>
            Questionnaire
          </RoundButton>
          <RoundButton
            variant="outlined"
            disabled={displayInfo.name === 'Questionnaire Response'}
            onClick={() =>
              setDisplayInfo({
                name: 'Questionnaire Response',
                data: questionnaireResponse
              })
            }>
            QuestionnaireResponse
          </RoundButton>
          <RoundButton
            variant="outlined"
            disabled={displayInfo.name === 'Variables'}
            onClick={() =>
              setDisplayInfo({
                name: 'Variables',
                data: fhirPathContext
              })
            }>
            Variables
          </RoundButton>
        </Box>
      </Stack>
      <pre>{JSON.stringify(displayInfo.data, null, 2)}</pre>
    </Box>
  );
}

export default DebugResponse;
