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
import RendererThemeProvider from '../../theme/Theme';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import useInitialiseForm from '../../hooks/useInitialiseForm';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import { QueryClientProvider } from '@tanstack/react-query';
import useRendererQueryClient from '../../hooks/useRendererQueryClient';
import BaseRenderer from './BaseRenderer';
import type Client from 'fhirclient/lib/Client';

/**
 * SmartFormsRenderer properties
 *
 * @property questionnaire - Input FHIR R4 Questionnaire to be rendered
 * @property questionnaireResponse - Pre-populated QuestionnaireResponse to be rendered (optional)
 * @property additionalVariables - Additional key-value pair of SDC variables `Record<name, variable extension>` for testing (optional)
 * @property terminologyServerUrl - Terminology server url to fetch terminology. If not provided, the default terminology server will be used. (optional)
 * @property fhirClient - FHIRClient object to perform further FHIR calls. At the moment it's only used in answerExpressions (optional)
 * @property readOnly - Applies read-only mode to all items in the form
 *
 * @author Sean Fong
 */
export interface SmartFormsRendererProps {
  questionnaire: Questionnaire;
  questionnaireResponse?: QuestionnaireResponse;
  additionalVariables?: Record<string, object>;
  terminologyServerUrl?: string;
  fhirClient?: Client;
  readOnly?: boolean;
}

/**
 * A self-initialising wrapper around the BaseRenderer rendering engine.
 * Will be deprecated in version 1.0.0. For alternative usage, see:
 * - https://github.com/aehrc/smart-forms/blob/main/packages/smart-forms-renderer/src/stories/storybookWrappers/InitialiseFormWrapperForStorybook.tsx#L40-L57
 *
 * @see SmartFormsRendererProps for props.
 *
 * @author Sean Fong
 */
function SmartFormsRenderer(props: SmartFormsRendererProps) {
  const {
    questionnaire,
    questionnaireResponse,
    additionalVariables,
    terminologyServerUrl,
    fhirClient,
    readOnly
  } = props;

  const isLoading = useInitialiseForm(
    questionnaire,
    questionnaireResponse,
    readOnly,
    terminologyServerUrl,
    additionalVariables,
    fhirClient
  );
  const queryClient = useRendererQueryClient();

  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" columnGap={2}>
        <CircularProgress />
        <Typography>Loading questionnaire...</Typography>
      </Box>
    );
  }

  return (
    <RendererThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BaseRenderer />
      </QueryClientProvider>
    </RendererThemeProvider>
  );
}

export default SmartFormsRenderer;
