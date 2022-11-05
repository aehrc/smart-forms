import React from 'react';
import { ListItemButton, Typography } from '@mui/material';
import { ChangeCircle } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { PageType } from '../../../interfaces/Enums';
import { PageSwitcherContext } from '../../../custom-contexts/PageSwitcherContext';

function ChangeQuestionnaireButton() {
  const pageSwitcher = React.useContext(PageSwitcherContext);

  // You have pending changes TODO are you sure to leave without saving your changes dialog
  // TODO save as draft saves as the same entry
  return (
    <ListItemButton onClick={() => pageSwitcher.goToPage(PageType.Picker)}>
      <ChangeCircle sx={{ mr: 2 }} />
      <ListItemText
        primary={
          <Typography fontSize={12} variant="h6">
            Change Questionnaire
          </Typography>
        }
      />
    </ListItemButton>
  );
}

export default ChangeQuestionnaireButton;
