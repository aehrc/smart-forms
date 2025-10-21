/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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
import React, { useState } from 'react';
import type { FhirResource, Patient, Practitioner, Questionnaire } from 'fhir/r4';
import { BaseRenderer } from '../../components';
import { QueryClientProvider } from '@tanstack/react-query';
import { RendererThemeProvider } from '../../theme';
import { useBuildForm, useRendererQueryClient } from '../../hooks';
import type Client from 'fhirclient/lib/Client';
import PrePopButtonForStorybook from './PrePopButtonForStorybook';
import { populateQuestionnaire } from '@aehrc/sdc-populate';
import { buildForm, extractObservationBased, removeEmptyAnswersFromResponse } from '../../utils';
import { STORYBOOK_TERMINOLOGY_SERVER_URL } from './globals';
import { fetchResourceCallback } from '../../api/callback';
import ActionBarForStorybook from './ActionBarForStorybook';
import CopyButtonsForStorybook from './CopyButtonsForStorybook';
import ExtractButtonForStorybook from './ExtractButtonForStorybook';
import { useQuestionnaireResponseStore, useQuestionnaireStore } from '../../stores';
import { Grid } from '@mui/material';
import Typography from '@mui/material/Typography';
import { extractResultIsOperationOutcome, inAppExtract } from '@aehrc/sdc-template-extract';

interface ExtractWrapperForStorybookProps {
  questionnaire: Questionnaire;
  fhirClient: Client;
  patient: Patient;
  user: Practitioner;
  extractMode: 'observation' | 'template';
}

/**
 * This is a demo wrapper which initialises the BaseRenderer with the passed in questionnaire using useBuildForm.
 * It adds extraction functionality on top of {@link PrePopWrapperForStorybook} using extract() from '@aehrc/sdc-template-extract'.
 *
 * Use this pattern if you do not have a pre-populated/pre-filled/draft response and want to pre-populate on the fly.
 * If you already have a questionnaireResponse, see https://github.com/aehrc/smart-forms/blob/main/packages/smart-forms-renderer/src/stories/storybookWrappers/BuildFormButtonTesterWrapperForStorybook.tsx instead
 *
 * @author Sean Fong
 */
function ExtractWrapperForStorybook(props: ExtractWrapperForStorybookProps) {
  const { questionnaire, fhirClient, patient, user, extractMode } = props;

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const updatableResponse = useQuestionnaireResponseStore.use.updatableResponse();

  const [isPopulating, setIsPopulating] = useState(false);
  const [extractedResource, setExtractedResource] = useState<FhirResource[] | FhirResource | null>(
    null
  );

  const queryClient = useRendererQueryClient();

  const isBuilding = useBuildForm({
    questionnaire,
    terminologyServerUrl: STORYBOOK_TERMINOLOGY_SERVER_URL
  });

  function handlePrepopulate() {
    setIsPopulating(true);

    populateQuestionnaire({
      questionnaire: questionnaire,
      fetchResourceCallback: fetchResourceCallback,
      fetchResourceRequestConfig: {
        sourceServerUrl: fhirClient.state.serverUrl,
        authToken: null
      },
      patient: patient,
      user: user
    }).then(async ({ populateSuccess, populateResult }) => {
      if (!populateSuccess || !populateResult) {
        setIsPopulating(false);
        return;
      }

      const { populatedResponse, populatedContext } = populateResult;

      // Call to buildForm to pre-populate the QR which repaints the entire BaseRenderer view
      await buildForm({
        questionnaire: questionnaire,
        questionnaireResponse: populatedResponse,
        terminologyServerUrl: STORYBOOK_TERMINOLOGY_SERVER_URL,
        additionalContext: {
          patient: patient,
          user: user,
          ...populatedContext
        }
      });

      setIsPopulating(false);
    });
  }

  function handleObservationExtract() {
    const observations = extractObservationBased(questionnaire, updatableResponse);
    setExtractedResource(observations);
  }

  function handleTemplateExtract() {
    const responseToExtract = removeEmptyAnswersFromResponse(
      sourceQuestionnaire,
      structuredClone(updatableResponse)
    );
    inAppExtract(responseToExtract, sourceQuestionnaire, null).then((inAppExtractOutput) => {
      const extractResult = inAppExtractOutput.extractResult;
      if (extractResultIsOperationOutcome(extractResult)) {
        setExtractedResource(extractResult);
      } else {
        setExtractedResource(extractResult.extractedBundle);
      }
    });
  }

  if (isBuilding) {
    return <div>Loading...</div>;
  }

  return (
    <RendererThemeProvider>
      <QueryClientProvider client={queryClient}>
        <div>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <ActionBarForStorybook>
                <PrePopButtonForStorybook
                  isPopulating={isPopulating}
                  onPopulate={handlePrepopulate}
                />
                <ExtractButtonForStorybook
                  extractMode={extractMode}
                  onObservationExtract={handleObservationExtract}
                  onTemplateExtract={handleTemplateExtract}
                />
                <CopyButtonsForStorybook />
              </ActionBarForStorybook>
              {isPopulating ? null : <BaseRenderer />}
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography>Extracted resource(s)</Typography>
              <pre style={{ fontSize: 10 }}>{JSON.stringify(extractedResource, null, 2)}</pre>
            </Grid>
          </Grid>
        </div>
      </QueryClientProvider>
    </RendererThemeProvider>
  );
}

export default ExtractWrapperForStorybook;
