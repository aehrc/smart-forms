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

import React from 'react';
import ThemeProvider from '../../theme/Theme';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import useInitialiseRenderer from '../../hooks/useInitialiseRenderer';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import { QueryClientProvider } from '@tanstack/react-query';
import useQueryClient from '../../hooks/useQueryClient';
import BaseRenderer from './BaseRenderer';
import type Client from 'fhirclient/lib/Client';

interface SmartFormsRendererProps {
  questionnaire: Questionnaire;
  questionnaireResponse?: QuestionnaireResponse;
  additionalVariables?: Record<string, object>;
  terminologyServerUrl?: string;
  fhirClient?: Client;
  readOnly?: boolean;
}

function SmartFormsRenderer(props: SmartFormsRendererProps) {
  const {
    questionnaire,
    questionnaireResponse,
    additionalVariables,
    terminologyServerUrl,
    fhirClient,
    readOnly
  } = props;

  const isLoading = useInitialiseRenderer(
    questionnaire,
    questionnaireResponse,
    additionalVariables,
    terminologyServerUrl,
    fhirClient,
    readOnly
  );
  const queryClient = useQueryClient();

  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" columnGap={2}>
        <CircularProgress />
        <Typography>Loading questionnaire...</Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BaseRenderer />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default SmartFormsRenderer;
