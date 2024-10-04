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

// @ts-ignore
import React from 'react';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { BaseRenderer } from '../../components';
import { QueryClientProvider } from '@tanstack/react-query';
import RendererThemeProvider from '../../theme/Theme';
import useRendererQueryClient from '../../hooks/useRendererQueryClient';
import type Client from 'fhirclient/lib/Client';
import useInitialiseForm from '../../hooks/useInitialiseForm';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

export interface InitialiseFormWrapperProps {
  questionnaire: Questionnaire;
  questionnaireResponse?: QuestionnaireResponse;
  readOnly?: boolean;
  terminologyServerUrl?: string;
  additionalVariables?: Record<string, object>;
  fhirClient?: Client;
}

/**
 * This is a one-to-one replacement for the SmartFormsRenderer for demo purposes.
 * Instead of using this React component, define your own wrapper component that uses the BaseRenderer directly.
 * Things to note:
 * - It is required to wrap the BaseRenderer with the QueryClientProvider to make requests.
 * - You can wrap the BaseRenderer with the RendererThemeProvider to apply the default renderer theme used in Smart Forms. Optionally, you can define your own ThemeProvider https://mui.com/material-ui/customization/theming/.
 * - Make your buildForm() call in a button click or other event handler. Alternatively, you can use the useInitialiseForm hook to initialise the form.
 * - Make your own initialiseFhirClient() call in a button click or other event handler. Alternatively, you can use the useInitialiseForm hook to initialise the form.
 * - The initialised FHIRClient is only used for further FHIR calls. It does not provide pre-population capabilities.
 *
 * For button click usage examples of buildForm(), see:
 * - https://github.com/aehrc/smart-forms/blob/main/packages/smart-forms-renderer/src/stories/storybookWrappers/BuildFormButtonTesterWrapperForStorybook.tsx
 * - https://github.com/aehrc/smart-forms/blob/main/packages/smart-forms-renderer/src/stories/storybookWrappers/BuildFormButtonForStorybook.tsx
 * - https://github.com/aehrc/smart-forms/blob/main/packages/smart-forms-renderer/src/stories/storybookWrappers/PrePopWrapperForStorybook.tsx
 * - https://github.com/aehrc/smart-forms/blob/main/packages/smart-forms-renderer/src/stories/storybookWrappers/PrePopButtonForStorybook.tsx
 *
 * @author Sean Fong
 */
function InitialiseFormWrapperForStorybook(props: InitialiseFormWrapperProps) {
  const {
    questionnaire,
    questionnaireResponse,
    readOnly,
    terminologyServerUrl,
    additionalVariables,
    fhirClient
  } = props;

  // The renderer requires a @tanstack/react-query QueryClientProvider to make requests
  const queryClient = useRendererQueryClient();

  /**
   * The useInitialiseForm hook provides initialisation logic for the form
   * Alternatively (and recommended to do so), you can initialise your form via a button click or other event handler.
   *
   * @see {@link https://github.com/aehrc/smart-forms/blob/main/packages/smart-forms-renderer/src/stories/BuildFormButtonForStorybook.tsx} for button click usage examples.
   */
  const isInitialising = useInitialiseForm(
    questionnaire,
    questionnaireResponse,
    readOnly,
    terminologyServerUrl,
    additionalVariables,
    fhirClient
  );

  // Free feel to customise your loading animation here
  if (isInitialising) {
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

export default InitialiseFormWrapperForStorybook;
