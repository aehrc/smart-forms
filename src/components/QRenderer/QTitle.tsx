import React from 'react';
import { Box, Typography } from '@mui/material';
import { Questionnaire } from 'fhir/r5';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import { useNavigate } from 'react-router-dom';
import { RoundButton } from '../StyledComponents/StyledComponents.styles';

interface Props {
  questionnaire: Questionnaire;
}
function QTitle(props: Props) {
  const { questionnaire } = props;
  const navigate = useNavigate();

  return (
    <>
      <Box display="flex" flexDirection="row" sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
          {questionnaire.title}
        </Typography>
        <RoundButton
          variant="outlined"
          startIcon={<ChangeCircleIcon />}
          onClick={() => navigate(`/picker`)}>
          Change Questionnaire
        </RoundButton>
      </Box>
    </>
  );
}

export default QTitle;
