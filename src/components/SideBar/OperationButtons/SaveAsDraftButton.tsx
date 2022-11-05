import React from 'react';
import { ListItemButton, Typography } from '@mui/material';
import { SaveAs } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { PageType } from '../../../interfaces/Enums';
import { PageSwitcherContext } from '../../../custom-contexts/PageSwitcherContext';

function SaveAsDraftButton() {
  const pageSwitcher = React.useContext(PageSwitcherContext);

  return (
    <ListItemButton onClick={() => alert('save as draft')}>
      <SaveAs sx={{ mr: 2 }} />
      <ListItemText
        primary={
          <Typography fontSize={12} variant="h6">
            Save as Draft
          </Typography>
        }
      />
    </ListItemButton>
  );
}

export default SaveAsDraftButton;
