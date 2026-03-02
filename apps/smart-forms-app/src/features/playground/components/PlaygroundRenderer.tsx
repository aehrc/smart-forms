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

import { useLayoutEffect, useRef, useState } from 'react';
import { BaseRenderer, rendererConfigStore } from '@aehrc/smart-forms-renderer';
import type { Patient, Practitioner } from 'fhir/r4';
import { Box, Typography } from '@mui/material';
import useLaunchContextNames from '../hooks/useLaunchContextNames.ts';
import ExtractMenu from './ExtractMenu.tsx';
import PopulateMenu from './PopulateMenu.tsx';
import type { RendererSpinner } from '../../renderer/types/rendererSpinner.ts';

interface PlaygroundRendererProps {
  sourceFhirServerUrl: string | null;
  patient: Patient | null;
  user: Practitioner | null;
  terminologyServerUrl: string;
  isExtracting: boolean;
  onObservationExtract: () => void;
  onTemplateExtract: (modifiedOnly: boolean) => void;
}

function PlaygroundRenderer(props: PlaygroundRendererProps) {
  const {
    sourceFhirServerUrl,
    patient,
    user,
    terminologyServerUrl,
    isExtracting,
    onObservationExtract,
    onTemplateExtract
  } = props;

  const initialSpinner: RendererSpinner = { isSpinning: false, status: 'prepopulate', message: '' };
  const [spinner, setSpinner] = useState<RendererSpinner>(initialSpinner);

  const toolbarRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (toolbarRef.current) {
      rendererConfigStore.getState().setRendererConfig({
        tabListStickyTop: toolbarRef.current.getBoundingClientRect().height
      });
    }
  }, []);

  const { patientName, userName } = useLaunchContextNames(patient, user);

  const isPrePopulating = spinner.isSpinning && spinner.status === 'prepopulate';
  const isRePopulateWriting = spinner.isSpinning && spinner.status === 'repopulate-write';

  return (
    <>
      <Box
        ref={toolbarRef}
        display="flex"
        alignItems="center"
        columnGap={1}
        px={1}
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
        <PopulateMenu
          sourceFhirServerUrl={sourceFhirServerUrl}
          patient={patient}
          user={user}
          terminologyServerUrl={terminologyServerUrl}
          spinner={spinner}
          onSpinnerChange={(newSpinner) => setSpinner(newSpinner)}
        />
        <ExtractMenu
          isExtracting={isExtracting}
          onObservationExtract={onObservationExtract}
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
      {isPrePopulating || isRePopulateWriting ? null : (
        <Box px={1}>
          <BaseRenderer />
        </Box>
      )}
    </>
  );
}

export default PlaygroundRenderer;
