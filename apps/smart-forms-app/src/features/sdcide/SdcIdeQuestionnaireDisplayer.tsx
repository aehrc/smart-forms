/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 10.59 230.
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

import type { Questionnaire } from 'fhir/r4';
import DebugResponseView from '../renderer/components/RendererDebugFooter/DebugResponseView.tsx';
import { Box, Button } from '@mui/material';
import { destroyForm } from '@aehrc/smart-forms-renderer';

interface SdcIdeQuestionnaireDisplayerProps {
  sourceQuestionnaire: Questionnaire;
}

function SdcIdeQuestionnaireDisplayer(props: SdcIdeQuestionnaireDisplayerProps) {
  const { sourceQuestionnaire } = props;

  return (
    <>
      <DebugResponseView displayObject={sourceQuestionnaire ?? null} showJsonTree={false} />
      <Box display="flex">
        <Box flexGrow={1} />
        <Button
          onClick={() => {
            destroyForm();
          }}>
          Pick another questionnaire
        </Button>
      </Box>
    </>
  );
}

export default SdcIdeQuestionnaireDisplayer;
