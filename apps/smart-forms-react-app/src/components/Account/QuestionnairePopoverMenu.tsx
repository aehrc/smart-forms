import { Box } from '@mui/material';
import React, { useContext } from 'react';
import { QuestionnaireProviderContext } from '../../App';
import { AccountNameTypography } from '../Typography/Typography';

function QuestionnairePopoverMenu() {
  const { questionnaire } = useContext(QuestionnaireProviderContext);

  return (
    <Box sx={{ my: 1.5, px: 2.5 }}>
      <AccountNameTypography name={questionnaire.title ?? ''} />
    </Box>
  );
}

export default QuestionnairePopoverMenu;
