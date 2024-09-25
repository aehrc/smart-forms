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
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Box, Button, Stack, Typography } from '@mui/material';
import type { RendererPropsState } from '../interfaces/standalone.interface.ts';
import { getResponse } from '@aehrc/smart-forms-renderer';
import type { QuestionnaireResponse } from 'fhir/r4';

interface StandaloneResourceViewerProps {
  rendererPropsState: RendererPropsState;
}

function StandaloneResourceViewer(props: StandaloneResourceViewerProps) {
  const { rendererPropsState } = props;

  const [selected, setSelected] = useState<
    'questionnaire' | 'response' | 'additionalVars' | 'terminologyServer'
  >('questionnaire');

  return (
    <Stack rowGap={1} m={2}>
      <ToggleButtonGroup
        color="primary"
        value={selected}
        exclusive
        onChange={(_, selected) => {
          setSelected(selected);
        }}>
        <ToggleButton value="questionnaire">Questionnaire</ToggleButton>
        <ToggleButton value="response">Response</ToggleButton>
        <ToggleButton value="additionalVars">Additional Variables</ToggleButton>
        <ToggleButton value="terminologyServer">Terminology Server</ToggleButton>
      </ToggleButtonGroup>
      <Box p={1}>
        <ResourceViewSwitcher rendererPropsState={rendererPropsState} selected={selected} />
      </Box>
    </Stack>
  );
}

interface ResourceViewSwitcherProps {
  rendererPropsState: RendererPropsState;
  selected: 'questionnaire' | 'response' | 'additionalVars' | 'terminologyServer';
}

function ResourceViewSwitcher(props: ResourceViewSwitcherProps) {
  const { rendererPropsState: state, selected } = props;

  const [latestResponse, setLatestResponse] = useState<QuestionnaireResponse | null>(
    structuredClone(state.response)
  );

  if (selected === 'questionnaire') {
    return <pre>{JSON.stringify(state.questionnaire, null, 2)}</pre>;
  }

  if (selected === 'response') {
    return (
      <>
        <Box display="flex" alignItems="center">
          <Button
            onClick={() => {
              const response = getResponse();
              setLatestResponse(response);
              console.log(getResponse());
            }}>
            Get latest response
          </Button>
          <Typography variant="subtitle2">(logs to console too!)</Typography>
        </Box>
        <pre>{JSON.stringify(latestResponse, null, 2)}</pre>
      </>
    );
  }

  if (selected === 'additionalVars') {
    return <pre>{JSON.stringify(state.additionalVars, null, 2)}</pre>;
  }

  if (selected === 'terminologyServer') {
    return (
      <>
        <Typography variant="subtitle2">
          Defaults to https://tx.ontoserver.csiro.au if null
        </Typography>
        <pre>{JSON.stringify(state.terminologyServerUrl, null, 2)}</pre>
      </>
    );
  }

  return <></>;
}

export default StandaloneResourceViewer;
