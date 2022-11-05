import React from 'react';
import { ListItemButton, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { PageType } from '../../../interfaces/Enums';
import { PageSwitcherContext } from '../../../custom-contexts/PageSwitcherContext';

function BackToPickerButton() {
  const pageSwitcher = React.useContext(PageSwitcherContext);

  return (
    <ListItemButton onClick={() => alert('back to picker')}>
      <ArrowBack sx={{ mr: 2 }} />
      <ListItemText
        primary={
          <Typography fontSize={12} variant="h6">
            Back To Questionnaire Picker
          </Typography>
        }
      />
    </ListItemButton>
  );
}

export default BackToPickerButton;
