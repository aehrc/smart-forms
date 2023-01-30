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

import React from 'react';
import { FormControlLabel, Switch, Typography } from '@mui/material';
import { DebugBarContainerBox } from './DebugBar.styles';

type Props = {
  hideQResponse: boolean;
  toggleHideQResponse: (checked: boolean) => unknown;
  enableWhenStatus: boolean;
  toggleEnableWhenStatus: (checked: boolean) => unknown;
};

function RendererDebugBar(props: Props) {
  const { hideQResponse, toggleHideQResponse, enableWhenStatus, toggleEnableWhenStatus } = props;
  return (
    <>
      <DebugBarContainerBox>
        <FormControlLabel
          control={
            <Switch
              onChange={(event) => toggleHideQResponse(event.target.checked)}
              checked={hideQResponse}
            />
          }
          label={<Typography variant="subtitle2">Hide Debug QResponse</Typography>}
        />
        <FormControlLabel
          control={
            <Switch
              onChange={(event) => toggleEnableWhenStatus(event.target.checked)}
              checked={enableWhenStatus}
            />
          }
          label={<Typography variant="subtitle2">EnableWhen checks</Typography>}
        />
      </DebugBarContainerBox>
    </>
  );
}

export default RendererDebugBar;
