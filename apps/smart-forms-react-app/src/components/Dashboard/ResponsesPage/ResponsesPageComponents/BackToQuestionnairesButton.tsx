// @mui
import { Button } from '@mui/material';
import React, { useContext } from 'react';
import Iconify from '../../../Misc/Iconify';
import { SelectedQuestionnaireContext } from '../../../../custom-contexts/SelectedQuestionnaireContext';
import { useNavigate } from 'react-router-dom';

function BackToQuestionnairesButton() {
  const { existingResponses } = useContext(SelectedQuestionnaireContext);
  const navigate = useNavigate();

  return existingResponses.length > 0 ? (
    <Button
      variant="contained"
      endIcon={<Iconify icon="material-symbols:arrow-back" />}
      sx={{
        px: 2.5,
        backgroundColor: 'primary.main',
        '&:hover': {
          backgroundColor: 'primary.dark'
        }
      }}
      onClick={() => {
        navigate('/questionnaires');
      }}>
      Go back
    </Button>
  ) : null;
}

export default BackToQuestionnairesButton;
