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
import PrePopButtonForPlayground from './PrePopButtonForPlayground.tsx';
import { populateQuestionnaire } from '@aehrc/sdc-populate';
import { BaseRenderer, useQuestionnaireStore } from '@aehrc/smart-forms-renderer';
import { fetchResourceCallback } from './PrePopCallbackForPlayground.tsx';
import type { Patient, Practitioner } from 'fhir/r4';
import { Box, Typography } from '@mui/material';
import useLaunchContextNames from '../hooks/useLaunchContextNames.ts';
import { buildFormWrapper } from '../../../utils/manageForm.ts';
import ExtractMenu from './ExtractMenu.tsx';

interface PlaygroundRendererProps {
  sourceFhirServerUrl: string | null;
  patient: Patient | null;
  user: Practitioner | null;
  terminologyServerUrl: string;
  isExtracting: boolean;
  onObservationExtract: () => void;
  onTemplateExtract: () => void;
  onStructureMapExtract: () => void;
}

function PlaygroundRenderer(props: PlaygroundRendererProps) {
  const {
    sourceFhirServerUrl,
    patient,
    user,
    terminologyServerUrl,
    isExtracting,
    onObservationExtract,
    onTemplateExtract,
    onStructureMapExtract
  } = props;

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const setPopulatedContext = useQuestionnaireStore.use.setPopulatedContext();

  const [isPopulating, setIsPopulating] = useState(false);

  const { patientName, userName } = useLaunchContextNames(patient, user);

  const prePopEnabled = sourceFhirServerUrl !== null && patient !== null;

  function handlePrepopulate() {
    if (!prePopEnabled) {
      return;
    }

    setIsPopulating(true);

    populateQuestionnaire({
      questionnaire: sourceQuestionnaire,
      fetchResourceCallback: fetchResourceCallback,
      fetchResourceRequestConfig: {
        sourceServerUrl: sourceFhirServerUrl,
        authToken: null
      },
      patient: patient,
      user: user ?? undefined
    }).then(async ({ populateSuccess, populateResult }) => {
      if (!populateSuccess || !populateResult) {
        setIsPopulating(false);
        return;
      }

      const { populatedResponse, populatedContext } = populateResult;

      // Call to buildForm to pre-populate the QR which repaints the entire BaseRenderer view
      await buildFormWrapper(
        sourceQuestionnaire,
        populatedResponse,
        undefined,
        terminologyServerUrl
      );
      if (populatedContext) {
        setPopulatedContext(populatedContext, true);
      }

      setIsPopulating(false);
    });
  }

  return (
    <>
      <Box display="flex" alignItems="center" columnGap={1.5} mx={1}>
        <PrePopButtonForPlayground
          prePopEnabled={prePopEnabled}
          isPopulating={isPopulating}
          onPopulate={handlePrepopulate}
        />
        <ExtractMenu
          isExtracting={isExtracting}
          onObservationExtract={onObservationExtract}
          onStructureMapExtract={onStructureMapExtract}
          onTemplateExtract={onTemplateExtract}
        />
        <Box flexGrow={1} />
        {patientName ? (
          <Typography variant="subtitle2" color="text.secondary">
            Patient: {patientName}
          </Typography>
        ) : null}
        {userName ? (
          <Typography variant="subtitle2" color="text.secondary">
            User: {userName}
          </Typography>
        ) : null}
      </Box>
      {isPopulating ? null : (
        <Box px={1}>
          <BaseRenderer />
        </Box>
      )}
    </>
  );
}

export default PlaygroundRenderer;
