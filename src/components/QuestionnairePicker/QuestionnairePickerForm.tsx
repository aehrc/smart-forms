import React, { useCallback, useState } from 'react';
import { Button, Card, Stack, TextField, Typography } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import { useNavigate } from 'react-router-dom';
import { Questionnaire } from 'fhir/r5';
import { QuestionnaireProvider } from '../../classes/QuestionnaireProvider';
import { debounce } from 'lodash';
import {
  getQuestionnairesFromBundle,
  loadQuestionnairesFromServer
} from '../../functions/LoadServerResourceFunctions';
import QuestionnairePickerQList from './QuestionnairePickerQList';

interface Props {
  questionnaires: Questionnaire[];
  setQuestionnaires: React.Dispatch<React.SetStateAction<Questionnaire[]>>;
  questionnaireProvider: QuestionnaireProvider;
  onSelectedIndexChange: (index: number) => unknown;
}

function QuestionnairePickerForm(props: Props) {
  const { questionnaires, setQuestionnaires, questionnaireProvider, onSelectedIndexChange } = props;

  const [searchInput, setSearchInput] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [qIsSearching, setQIsSearching] = useState(false);
  const navigate = useNavigate();

  const functionDebounce = useCallback(
    debounce((input: string) => {
      loadQuestionnairesFromServer(`title=${input}`)
        .then((bundle) => {
          if (bundle.entry) {
            setQuestionnaires(getQuestionnairesFromBundle(bundle));
          } else {
            setQuestionnaires([]);
          }
          setQIsSearching(false);
        })
        .catch((error) => {
          console.log(error);
          setQIsSearching(false);
        });
    }, 500),
    []
  );

  return (
    <>
      <Stack direction={'column'} spacing={3}>
        <Typography variant="h1" fontWeight="bold" fontSize={42} color="inherit">
          Questionnaires
        </Typography>

        <TextField
          value={searchInput}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const input = event.target.value;
            setQIsSearching(true);
            setSelectedIndex(null);
            setQuestionnaires([]);
            setSearchInput(input);
            functionDebounce(input);
          }}
          label="Search Questionnaires"
        />

        <Card elevation={1} sx={{ height: 515 }}>
          <QuestionnairePickerQList
            questionnaires={questionnaires}
            searchInput={searchInput}
            selectedIndex={selectedIndex}
            qIsSearching={qIsSearching}
            onSelectedIndexChange={(index) => {
              onSelectedIndexChange(index);
              setSelectedIndex(index);
            }}
          />
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
