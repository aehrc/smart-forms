import React, { useContext } from 'react';
import { Box, Typography } from '@mui/material';
import { Questionnaire } from 'fhir/r5';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import { RoundButton } from '../StyledComponents/Buttons.styles';
import { QuestionnaireActiveContext } from '../../custom-contexts/QuestionnaireActiveContext';

interface Props {
  questionnaire: Questionnaire;
}
function QTitle(props: Props) {
  const { questionnaire } = props;
  const questionnaireActiveContext = useContext(QuestionnaireActiveContext);

  return (
    <>
      <Box display="flex" flexDirection="row" sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
          {questionnaire.title}
        </Typography>
        <RoundButton
          variant="outlined"
          startIcon={<ChangeCircleIcon />}
          onClick={() => questionnaireActiveContext.setQuestionnaireActive(false)}>
          Change Questionnaire
        </RoundButton>
      </Box>
    </>
  );
}

export default QTitle;
