import * as React from 'react';
import { Box, Divider } from '@mui/material';
import SideBarBottom from './SideBarBottom';
import { SideBarCard, SideBarListBox } from './SideBar.styles';
import { SideBarOverlineTypography } from '../StyledComponents/Typographys.styles';
import { SecondaryNonSelectableList } from '../StyledComponents/Lists.styles';

function SideBar(props: { children: React.ReactNode }) {
  const { children } = props;

  return (
    <SideBarCard>
      <SideBarListBox>
        <Box sx={{ m: 1 }}>
          <SideBarOverlineTypography variant="overline">Operations</SideBarOverlineTypography>
          <SecondaryNonSelectableList disablePadding>{children}</SecondaryNonSelectableList>
        </Box>
        <Box sx={{ flexGrow: 1 }}></Box>
        <Divider />
        <SideBarBottom />
      </SideBarListBox>
    </SideBarCard>
  );
}

export default SideBar;
