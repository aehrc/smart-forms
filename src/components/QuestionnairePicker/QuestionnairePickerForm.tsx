import React, { useState } from 'react';
import { Button, Divider, List, ListItemButton, ListItemText, Typography } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import { useNavigate } from 'react-router-dom';
import { slugify } from '../qform/functions/StringFunctions';
import { Questionnaire } from 'fhir/r5';

interface Props {
  questionnaires: Questionnaire[];
}

function QuestionnairePickerForm(props: Props) {
  const { questionnaires } = props;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  console.log(questionnaires);
  console.log(selectedIndex);

  return (
    <>
      <Typography variant="h1" fontWeight="bold" fontSize={36} color="inherit">
        Select a Questionnaire
      </Typography>
      <Divider sx={{ mt: 3 }} />

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
          if (selectedIndex) {
            const selectedQuestionnaireId = `${questionnaires[selectedIndex].id}`;
            navigate(`/form/${slugify(selectedQuestionnaireId)}`);
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
