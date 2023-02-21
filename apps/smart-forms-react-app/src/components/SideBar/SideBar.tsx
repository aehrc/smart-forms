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
import { Box, Divider, Stack } from '@mui/material';
import SideBarBottom from './SideBarBottom';
import { SideBarCard, SideBarListBox } from './SideBar.styles';
import { SideBarOverlineTypography } from '../StyledComponents/Typographys.styles';
import { SecondaryNonSelectableList } from '../StyledComponents/Lists.styles';
import { SideBarContext } from '../../custom-contexts/SideBarContext';
import SideBarBottomCollapsed from './SideBarBottomCollapsed';

function SideBar(props: { children: React.ReactNode }) {
  const { children } = props;

  const { sideBarIsExpanded } = useContext(SideBarContext);

  return (
    <SideBarCard>
      <SideBarListBox>
        <Box sx={{ m: 1 }}>
          {sideBarIsExpanded ? (
            <>
              <SideBarOverlineTypography variant="overline">Operations</SideBarOverlineTypography>
              <SecondaryNonSelectableList disablePadding>{children}</SecondaryNonSelectableList>
            </>
          ) : (
            <Stack alignItems="center">
              <SecondaryNonSelectableList disablePadding>{children}</SecondaryNonSelectableList>
            </Stack>
          )}
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Divider />
        {sideBarIsExpanded ? <SideBarBottom /> : <SideBarBottomCollapsed />}
      </SideBarListBox>
    </SideBarCard>
  );
}

export default SideBar;
