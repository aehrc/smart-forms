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
import { SideBarContext } from '../../custom-contexts/SideBarContext';
import { Box, Stack, Tooltip } from '@mui/material';
import logo from '../../data/images/CSIRO_Logo.png';
import { OrganisationLogoBox, SideBarIconButton } from './SideBarBottom.styles';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';

function SideBarBottomCollapsed() {
  const { sideBarIsExpanded, setSideBarIsExpanded } = useContext(SideBarContext);

  return (
    <Stack display="flex" flexDirection="column" alignItems="center" sx={{ m: 1 }}>
      <OrganisationLogoBox>
        <Box
          component="img"
          sx={{
            maxHeight: { xs: 30 },
            maxWidth: { xs: 30 }
          }}
          src={logo}
        />
      </OrganisationLogoBox>

      <Box>
        <Tooltip title="Expand Sidebar" placement="right">
          <span>
            <SideBarIconButton onClick={() => setSideBarIsExpanded(!sideBarIsExpanded)}>
              <KeyboardDoubleArrowRightIcon fontSize="small" />
            </SideBarIconButton>
          </span>
        </Tooltip>
      </Box>
    </Stack>
  );
}

export default SideBarBottomCollapsed;
