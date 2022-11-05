import React from 'react';
import { ListItemButton, Typography } from '@mui/material';
import { Print } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { PageType } from '../../../interfaces/Enums';
import { PageSwitcherContext } from '../../../custom-contexts/PageSwitcherContext';

function PrintPreviewButton() {
  const pageSwitcher = React.useContext(PageSwitcherContext);

  return (
    <ListItemButton onClick={() => alert('print')}>
      <Print sx={{ mr: 2 }} />
      <ListItemText
        primary={
          <Typography fontSize={12} variant="h6">
            Print Preview
          </Typography>
        }
      />
    </ListItemButton>
  );
}

export default PrintPreviewButton;
