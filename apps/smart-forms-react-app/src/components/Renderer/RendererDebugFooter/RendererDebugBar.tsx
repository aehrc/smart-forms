/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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

import React, { useContext } from 'react';
import { Box, FormControlLabel, Switch, Typography } from '@mui/material';
import { EnableWhenContext } from '../../../custom-contexts/EnableWhenContext';

interface Props {
  isHidden: boolean;
  toggleIsHidden: (checked: boolean) => unknown;
}

function RendererDebugBar(props: Props) {
  const { isHidden, toggleIsHidden } = props;

  const { toggleActivation, isActivated } = useContext(EnableWhenContext);

  return (
    <Box display="flex" flexDirection="row-reverse">
      <FormControlLabel
        control={
          <Switch
            onChange={(event) => toggleActivation(event.target.checked)}
            checked={isActivated}
          />
        }
        label={
          <Typography variant="overline">
            {isActivated ? 'EnableWhen on' : 'EnableWhen off'}
          </Typography>
        }
      />
      <FormControlLabel
        control={
          <Switch onChange={(event) => toggleIsHidden(event.target.checked)} checked={isHidden} />
        }
        label={
          <Typography variant="overline">
            {isHidden ? 'Debug response hidden' : 'Debug response shown'}
          </Typography>
        }
      />
    </Box>
  );
}

export default RendererDebugBar;
