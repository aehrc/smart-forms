import React from 'react';
import { ListItemButton, Typography } from '@mui/material';
import { Sync } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { PageType } from '../../../interfaces/Enums';
import { PageSwitcherContext } from '../../../custom-contexts/PageSwitcherContext';

function RefreshQuestionnaireListButton() {
  const pageSwitcher = React.useContext(PageSwitcherContext);

  return (
    <ListItemButton onClick={() => alert('clear questionnaire list')}>
      <Sync sx={{ mr: 2 }} />
      <ListItemText
        primary={
          <Typography fontSize={12} variant="h6">
            Refresh Questionnaires
          </Typography>
        }
      />
    </ListItemButton>
  );
}

export default RefreshQuestionnaireListButton;
