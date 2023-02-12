import React from 'react';
import { ListItemButton, ListItemText, Typography } from '@mui/material';

interface Props {
  selected: boolean;
  tabText: string;
  listIndex: number;
  updateTabIndex: (newTabIndex: number) => unknown;
}

function FormBodySingleTab(props: Props) {
  const { selected, tabText, listIndex, updateTabIndex } = props;

  return (
    <ListItemButton
      selected={selected}
      sx={{ my: 0.5 }}
      onClick={() => updateTabIndex(listIndex + 1)}>
      <ListItemText primary={<Typography variant="subtitle2">{tabText}</Typography>} />
    </ListItemButton>
  );
}

export default FormBodySingleTab;
