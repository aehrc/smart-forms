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

import React, { memo, useContext } from 'react';
import logo from '../../data/images/csiro-logo.png';
import { Box, Grid, Tooltip } from '@mui/material';
import {
  OrganisationLogoBox,
  SideBarExpandButtonBox,
  SideBarIconButton
} from './SideBarBottom.styles';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import { SideBarContext } from '../../custom-contexts/SideBarContext';

function SideBarBottom() {
  const { sideBarIsExpanded, setSideBarIsExpanded } = useContext(SideBarContext);

  return (
    <Grid container alignItems="center">
      <Grid item xs={4}></Grid>
      <Grid item xs={4}>
        <OrganisationLogoBox>
          <Box
            component="img"
            sx={{
              maxHeight: { xs: 35 },
              maxWidth: { xs: 35 }
            }}
            src={logo}
          />
        </OrganisationLogoBox>
      </Grid>

      <Grid item xs={4}>
        <SideBarExpandButtonBox>
          <Tooltip title="Collapse Sidebar" placement="right">
            <span>
              <SideBarIconButton onClick={() => setSideBarIsExpanded(!sideBarIsExpanded)}>
                <KeyboardDoubleArrowLeftIcon fontSize="small" />
              </SideBarIconButton>
            </span>
          </Tooltip>
        </SideBarExpandButtonBox>
      </Grid>
    </Grid>
  );
}

export default memo(SideBarBottom);
