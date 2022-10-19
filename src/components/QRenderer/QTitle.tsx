import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Questionnaire } from 'fhir/r5';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import { useNavigate } from 'react-router-dom';

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
        <Button
          variant="contained"
          sx={{ borderRadius: 20 }}
          onClick={() => {
            navigate(`/picker`);
          }}>
          <ChangeCircleIcon sx={{ mr: 1 }} />
          Change Questionnaire
        </Button>
      </Box>
    </>
  );
}

export default QTitle;
