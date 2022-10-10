import React, { useState } from 'react';
import { Button, Card, List, ListItemButton, ListItemText, Stack, Typography } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import { useNavigate } from 'react-router-dom';
import { Questionnaire } from 'fhir/r5';
import { QuestionnaireProvider } from '../qform/QuestionnaireProvider';

interface Props {
  questionnaires: Questionnaire[];
  questionnaireProvider: QuestionnaireProvider;
  onSelectedIndexChange: (index: number) => unknown;
}

function QuestionnairePickerForm(props: Props) {
  const { questionnaires, questionnaireProvider, onSelectedIndexChange } = props;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  return (
    <>
      <Stack direction={'column'}>
        <Typography variant="h1" fontWeight="bold" fontSize={42} color="inherit">
          Questionnaires
        </Typography>

        <Card elevation={2} sx={{ my: 3.5 }}>
          <List sx={{ width: '100%', maxHeight: 540, overflow: 'auto', py: 0 }}>
            {questionnaires.map((questionnaire, i) => (
              <React.Fragment key={questionnaire.id}>
                <ListItemButton
                  selected={selectedIndex === i}
                  sx={{ p: 2 }}
                  onClick={() => {
                    onSelectedIndexChange(i);
                    setSelectedIndex(i);
                  }}>
                  <ListItemText
                    primary={`${questionnaire.title}`}
                    primaryTypographyProps={{ fontSize: '18px' }}
                    sx={{ px: 1.5 }}
                  />
                </ListItemButton>
              </React.Fragment>
            ))}
          </List>
        </Card>

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
      </Stack>
    </>
  );
}

export default QuestionnairePickerForm;
