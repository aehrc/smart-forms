import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import { RoundButton } from '../StyledComponents/Buttons.styles';

interface Props {
  goToPicker: () => unknown;
}
function NoQuestionnaireErrorPage(props: Props) {
  const { goToPicker } = props;

  return (
    <Box display="flex" flexDirection="column" justifyContent="center" minHeight="90vh">
      <Box width={800} margin="auto">
        <Box display="flex" flexDirection="column" alignItems="center">
          <Stack spacing={3}>
            <Typography variant="h6" fontSize={50} textAlign="center">
              Questionnaire not found
            </Typography>
            <Box>
              <Typography fontSize={18} textAlign="center">
                {"Uh oh, we can't seem to locate a questionnaire."}
              </Typography>
              <Typography fontSize={18} textAlign="center">
                Select a questionnaire from the following page and you will be all set.
              </Typography>
            </Box>

            <RoundButton
              variant="outlined"
              sx={{ height: 40 }}
              startIcon={<ArticleIcon />}
              onClick={goToPicker}>
              Select Questionnaire
            </RoundButton>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

export default NoQuestionnaireErrorPage;
