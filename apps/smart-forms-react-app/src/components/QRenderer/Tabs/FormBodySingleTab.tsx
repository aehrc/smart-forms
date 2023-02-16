import React from 'react';
import { ListItemButton, ListItemText, Tooltip, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { TabListItemIcon } from './Tab.styles';

interface Props {
  selected: boolean;
  tabText: string;
  listIndex: number;
  markedAsComplete: boolean;
  updateTabIndex: (newTabIndex: number) => unknown;
}

function FormBodySingleTab(props: Props) {
  const { selected, tabText, listIndex, markedAsComplete, updateTabIndex } = props;

  return (
    <ListItemButton
      selected={selected}
      sx={{ my: 0.5 }}
      onClick={() => updateTabIndex(listIndex + 1)}>
      <TabListItemIcon>
        {markedAsComplete ? (
          <Tooltip title="Completed">
            <CheckCircleIcon fontSize="small" color="success" />
          </Tooltip>
        ) : (
          <Tooltip title="In progress">
            <PendingIcon fontSize="small" />
          </Tooltip>
        )}
      </TabListItemIcon>
      <ListItemText primary={<Typography variant="subtitle2">{tabText}</Typography>} />
    </ListItemButton>
  );
}

export default FormBodySingleTab;
