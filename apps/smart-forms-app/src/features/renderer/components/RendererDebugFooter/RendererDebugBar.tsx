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

import { Box, FormControlLabel, Switch, Typography } from '@mui/material';
import { useQuestionnaireStore } from '@aehrc/smart-forms-renderer';

interface RendererDebugBarProps {
  isHidden: boolean;
  toggleIsHidden: (checked: boolean) => unknown;
}

function RendererDebugBar(props: RendererDebugBarProps) {
  const { isHidden, toggleIsHidden } = props;

  const enableWhenIsActivated = useQuestionnaireStore.use.enableWhenIsActivated();
  const toggleEnableWhenActivation = useQuestionnaireStore.use.toggleEnableWhenActivation();

  return (
    <Box display="flex" flexDirection="row-reverse">
      <FormControlLabel
        control={
          <Switch
            onChange={(event) => toggleEnableWhenActivation(event.target.checked)}
            checked={enableWhenIsActivated}
          />
        }
        label={
          <Typography variant="overline">
            {enableWhenIsActivated ? 'EnableWhen on' : 'EnableWhen off'}
          </Typography>
        }
      />
      <FormControlLabel
        control={
          <Switch onChange={(event) => toggleIsHidden(event.target.checked)} checked={isHidden} />
        }
        label={
          <Typography variant="overline">
            {isHidden ? 'Debug panel hidden' : 'Debug panel shown'}
          </Typography>
        }
      />
    </Box>
  );
}

export default RendererDebugBar;
