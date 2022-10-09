import React, { useState } from 'react';
import { Button, Divider, List, ListItemButton, ListItemText, Typography } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import { useNavigate } from 'react-router-dom';
import { Questionnaire } from 'fhir/r5';
import { QuestionnaireProvider } from '../qform/QuestionnaireProvider';

interface Props {
  questionnaires: Questionnaire[];
  questionnaireProvider: QuestionnaireProvider;
}

function QuestionnairePickerForm(props: Props) {
  const { questionnaires, questionnaireProvider } = props;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  return (
    <>
      <Typography variant="h2" fontWeight="bold" fontSize={36} color="inherit">
        Select a Questionnaire
      </Typography>
      <Divider sx={{ mt: 2.5 }} />

      <List sx={{ width: '100%', maxHeight: 440, overflow: 'auto', py: 0 }}>
        {questionnaires.map((questionnaire, i) => (
          <React.Fragment key={questionnaire.id}>
            <ListItemButton selected={selectedIndex === i} onClick={() => setSelectedIndex(i)}>
              <ListItemText
                primary={`${questionnaire.title}`}
                primaryTypographyProps={{ fontSize: '18px' }}
              />
            </ListItemButton>
            {i !== questionnaires.length - 1 ? <Divider component="li" /> : null}
          </React.Fragment>
        ))}
      </List>

      <Divider sx={{ mb: 3 }} />
      <Button
        variant="contained"
        disabled={typeof selectedIndex !== 'number'}
        onClick={() => {
          if (typeof selectedIndex === 'number') {
            questionnaireProvider.setQuestionnaire(questionnaires[selectedIndex]);
            navigate(`/`);
          }
        }}
        sx={{ borderRadius: 20, py: 1.5, fontSize: 16, textTransform: 'Capitalize' }}>
        Go to Questionnaire
        <ArticleIcon sx={{ ml: 1.5 }} />
      </Button>
    </>
  );
}

export default QuestionnairePickerForm;
