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
import { Accordion, AccordionDetails, AccordionSummary, Stack, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ProgressSpinner from '../../../components/Spinners/ProgressSpinner.tsx';
import type { AuthState } from '../types/authorisation.interface.ts';
import CenteredWrapper from '../../../components/Wrapper/CenteredWrapper.tsx';
import UnlaunchedButton from '../../../components/Button/UnlaunchedButton.tsx';

interface RenderAuthStatusProps {
  authState: AuthState;
}

function RenderAuthStatus(props: RenderAuthStatusProps) {
  const { authState } = props;

  const [isExpanded, setIsExpanded] = useState(false);

  const launchFailed =
    authState.hasClient === false || authState.hasUser === false || authState.hasPatient === false;

  if (launchFailed) {
    return (
      <CenteredWrapper>
        <Stack rowGap={2}>
          <Typography variant="h3">An error occurred while authorising the launch.</Typography>
          <Typography fontSize={13}>
            {'Try relaunching the app or contact your administrator for assistance.'}
          </Typography>
        </Stack>

        {authState.errorMessage ? (
          <Accordion expanded={isExpanded} onChange={(_, expanded) => setIsExpanded(expanded)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>Error details:</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>{authState.errorMessage}</Typography>
            </AccordionDetails>
          </Accordion>
        ) : null}
        <UnlaunchedButton />
      </CenteredWrapper>
    );
  }

  return <ProgressSpinner message={'Getting ready'} />;
}

export default RenderAuthStatus;
