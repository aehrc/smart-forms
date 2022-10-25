import * as React from 'react';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import QOperationList from './QOperationsList';
import { Questionnaire } from 'fhir/r5';
import { getShortText } from '../../../functions/ItemControlFunctions';
import { isTab } from '../../../functions/TabFunctions';
import { hideQItem } from '../../../functions/QItemFunctions';
import { Box } from '@mui/material';
import {
  DrawerListBox,
  DrawerSubTitleTypography,
  DrawerTabList,
  DrawerTitleTypography,
  TabListTypography
} from './QDrawerList.styles';
import QDrawerOrganisationLogo from './QDrawerOrganisationLogo';

interface Props {
  questionnaire: Questionnaire;
}

function QDrawerList(props: Props) {
  const { questionnaire } = props;

  let tabList: string[] = [];
  const qForm = questionnaire.item;
  if (qForm) {
    if (qForm[0].item) {
      tabList = qForm[0].item
        .filter((qItem) => isTab(qItem) && !hideQItem(qItem))
        .map((qItem) => getShortText(qItem) ?? `${qItem.text}`);
    }
  }

  return (
    <DrawerListBox display="flex" flexDirection="column" minHeight="100vh">
      <Toolbar variant="dense">
        <Box
          textAlign="center"
          sx={{
            width: '100%'
          }}>
          <DrawerTitleTypography>SMART Health Checks</DrawerTitleTypography>
        </Box>
      </Toolbar>
      <Divider />
      <QOperationList />

      <Divider />

      <DrawerSubTitleTypography variant="overline">Tabs</DrawerSubTitleTypography>
      <DrawerTabList dense disablePadding sx={{ mb: 1, overflow: 'auto' }}>
        {tabList.map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton selected={index === 3}>
              <ListItemText
                primary={<TabListTypography variant="subtitle2">{text}</TabListTypography>}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </DrawerTabList>
      <Box sx={{ flexGrow: 1 }}></Box>
      <Divider />
      <QDrawerOrganisationLogo />
    </DrawerListBox>
  );
}

export default QDrawerList;
