import React from 'react';
import { Box, Button, Container } from '@mui/material';
import parse from 'html-react-parser';
import { qrToHTML } from '../../functions/PreviewFunctions';
import { QuestionnaireProvider } from '../../classes/QuestionnaireProvider';
import { QuestionnaireResponseProvider } from '../../classes/QuestionnaireResponseProvider';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';

interface Props {
  questionnaireProvider: QuestionnaireProvider;
  questionnaireResponseProvider: QuestionnaireResponseProvider;
}

function QPreview(props: Props) {
  const { questionnaireProvider, questionnaireResponseProvider } = props;

  const questionnaire = questionnaireProvider.questionnaire;
  const qResponse = questionnaireResponseProvider.questionnaireResponse;
  const navigate = useNavigate();

  const test = qrToHTML(questionnaire, qResponse);
  const parsed = parse(test);

  // TODO fix preview page styling
  // TODO text too big and too close to borders
  // TODO fix dark mode grey text when printing
  // TODO check qr status and display edit button conditionally

  return (
    <Container maxWidth="lg">
      <Box displayPrint="none" display="flex" flexDirection={'row'}>
        <Box sx={{ flexGrow: 1 }}>
          <Button variant="contained" onClick={() => window.print()} sx={{ borderRadius: 20 }}>
            <PrintIcon sx={{ mr: 1 }} />
            Print Preview
          </Button>
        </Box>

        <Box>
          {qResponse.status === 'completed' ? null : (
            <Button variant="contained" onClick={() => navigate(`/`)} sx={{ borderRadius: 20 }}>
              <EditIcon sx={{ mr: 1 }} />
              Edit Response
            </Button>
          )}
        </Box>
      </Box>
      <Box sx={{ my: 3 }}>
        <div>{parsed}</div>
      </Box>
    </Container>
  );
}

export default QPreview;
