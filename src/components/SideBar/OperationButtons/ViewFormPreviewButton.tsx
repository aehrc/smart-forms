import React from 'react';
import { ListItemButton, Typography } from '@mui/material';
import { Visibility } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { PageType } from '../../../interfaces/Enums';
import { PageSwitcherContext } from '../../../custom-contexts/PageSwitcherContext';

function ViewFormPreviewButton() {
  const pageSwitcher = React.useContext(PageSwitcherContext);

  return (
    <ListItemButton onClick={() => pageSwitcher.goToPage(PageType.FormPreview)}>
      <Visibility sx={{ mr: 2 }} />
      <ListItemText
        primary={
          <Typography fontSize={12} variant="h6">
            View Preview
          </Typography>
        }
      />
    </ListItemButton>
  );
}

export default ViewFormPreviewButton;
