import * as React from 'react';
import { Box, Divider, Stack } from '@mui/material';
import SideBarBottom from './SideBarBottom';
import { SideBarCard, SideBarListBox } from './SideBar.styles';
import { SideBarOverlineTypography } from '../StyledComponents/Typographys.styles';
import { SecondaryNonSelectableList } from '../StyledComponents/Lists.styles';
import { SideBarContext } from '../../custom-contexts/SideBarContext';
import SideBarBottomCollapsed from './SideBarBottomCollapsed';

function SideBar(props: { children: React.ReactNode }) {
  const { children } = props;

  const sideBar = React.useContext(SideBarContext);

  return (
    <SideBarCard>
      <SideBarListBox>
        <Box sx={{ m: 1 }}>
          {sideBar.isExpanded ? (
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
        {sideBar.isExpanded ? <SideBarBottom /> : <SideBarBottomCollapsed />}
      </SideBarListBox>
    </SideBarCard>
  );
}

export default SideBar;
