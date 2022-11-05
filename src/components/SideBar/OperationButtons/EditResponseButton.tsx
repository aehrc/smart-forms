import React from 'react';
import { ListItemButton, Typography } from '@mui/material';
import { Edit } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { PageType } from '../../../interfaces/Enums';
import { PageSwitcherContext } from '../../../custom-contexts/PageSwitcherContext';

function EditResponseButton() {
  const pageSwitcher = React.useContext(PageSwitcherContext);

  return (
    <ListItemButton onClick={() => alert('edit response - to renderer')}>
      <Edit sx={{ mr: 2 }} />
      <ListItemText
        primary={
          <Typography fontSize={12} variant="h6">
            Edit Response
          </Typography>
        }
      />
    </ListItemButton>
  );
}

export default EditResponseButton;
