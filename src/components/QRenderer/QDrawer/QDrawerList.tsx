import * as React from 'react';
import Divider from '@mui/material/Divider';
import QOperationList from './QOperationsList';
import { Box } from '@mui/material';
import { DrawerListBox, SideBarCard } from './QDrawerList.styles';
import QDrawerOrganisationLogo from './QDrawerOrganisationLogo';

function QDrawerList() {
  return (
    <SideBarCard sx={{ height: '95vh', borderRadius: 0 }}>
      <DrawerListBox>
        <QOperationList />

        <Box sx={{ flexGrow: 1 }}></Box>
        <Divider />
        <QDrawerOrganisationLogo />
      </DrawerListBox>
    </SideBarCard>
  );
}

export default QDrawerList;
