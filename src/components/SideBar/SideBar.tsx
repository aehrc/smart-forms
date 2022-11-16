import * as React from 'react';
import Divider from '@mui/material/Divider';
import { Box } from '@mui/material';
import OrganisationLogo from '../OrganisationLogo';
import { SideBarCard, SideBarListBox } from './SideBar.styles';
import { SideBarOverlineTypography } from '../StyledComponents/Typographys.styles';
import { SecondaryNonSelectableList } from '../StyledComponents/Lists.styles';

function SideBar(props: { children: any }) {
  const { children } = props;

  return (
    <SideBarCard>
      <SideBarListBox>
        <Box sx={{ my: 1 }}>
          <SideBarOverlineTypography variant="overline">Operations</SideBarOverlineTypography>
          <SecondaryNonSelectableList disablePadding>{children}</SecondaryNonSelectableList>
        </Box>
        <Box sx={{ flexGrow: 1 }}></Box>
        <Divider />
        <OrganisationLogo />
      </SideBarListBox>
    </SideBarCard>
  );
}

export default SideBar;
