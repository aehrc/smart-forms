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
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Typography
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Iconify from '../../../components/Misc/Iconify.tsx';
import ProgressSpinner from '../../../components/Misc/ProgressSpinner.tsx';
import { useNavigate } from 'react-router-dom';
import { AuthState } from '../types/authorisation.interface.ts';

interface RenderAuthStatusProps {
  authState: AuthState;
}

function RenderAuthStatus(props: RenderAuthStatusProps) {
  const { authState } = props;

  const [isExpanded, setIsExpanded] = useState(false);

  const navigate = useNavigate();

  if (
    authState.hasClient === false ||
    authState.hasUser === false ||
    authState.hasPatient === false
  ) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        <ErrorIcon color="error" sx={{ fontSize: 80 }} />
        <Box textAlign="center">
          <Typography variant="subtitle1">Launch failed.</Typography>
        </Box>

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

        <Box display="flex" flexDirection="row-reverse" width="100%">
          <Button
            variant="contained"
            endIcon={<Iconify icon="material-symbols:arrow-forward" />}
            data-test="button-create-response"
            onClick={() => {
              navigate('/dashboard/questionnaires');
            }}>
            Proceed to app anyway
          </Button>
        </Box>
      </Box>
    );
  }

  return <ProgressSpinner message={'Getting ready'} />;
}

export default RenderAuthStatus;
