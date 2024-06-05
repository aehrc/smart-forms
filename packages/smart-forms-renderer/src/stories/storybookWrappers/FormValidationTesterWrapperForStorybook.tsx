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
import { RendererThemeProvider } from '../../theme';
import { useBuildForm, useRendererQueryClient } from '../../hooks';
import { Grid } from '@mui/material';
import FormValidationViewerForStorybook from './FormValidationViewerForStorybook';
import { STORYBOOK_TERMINOLOGY_SERVER_URL } from './globals';

interface FormValidationTesterWrapperForStorybookProps {
  questionnaire: Questionnaire;
  questionnaireResponse?: QuestionnaireResponse;
}

function FormValidationTesterWrapperForStorybook(
  props: FormValidationTesterWrapperForStorybookProps
) {
  const { questionnaire, questionnaireResponse } = props;

  const isBuilding = useBuildForm(
    questionnaire,
    questionnaireResponse,
    undefined,
    STORYBOOK_TERMINOLOGY_SERVER_URL
  );

  const queryClient = useRendererQueryClient();

  if (isBuilding) {
    return <div>Loading...</div>;
  }

  return (
    <RendererThemeProvider>
      <QueryClientProvider client={queryClient}>
        <div>
          <Grid container>
            <Grid item xs={6}>
              <BaseRenderer />
            </Grid>
            <Grid item xs={6}>
              <FormValidationViewerForStorybook />
            </Grid>
          </Grid>
        </div>
      </QueryClientProvider>
    </RendererThemeProvider>
  );
}

export default FormValidationTesterWrapperForStorybook;
