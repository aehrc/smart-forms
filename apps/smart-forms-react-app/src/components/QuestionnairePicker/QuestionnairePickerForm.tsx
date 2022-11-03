import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import { useNavigate } from 'react-router-dom';
import { Questionnaire, QuestionnaireResponse } from 'fhir/r5';
import { QuestionnaireProvider } from '../../classes/QuestionnaireProvider';
import { debounce } from 'lodash';
import {
  getQuestionnairesFromBundle,
  loadQuestionnairesFromLocal,
  loadQuestionnairesFromServer
} from '../../functions/LoadServerResourceFunctions';
import QuestionnairePickerQList from './QuestionnairePickerQList';
import { QuestionnaireResponseProvider } from '../../classes/QuestionnaireResponseProvider';

interface Props {
  questionnaires: Questionnaire[];
  questionnaireProvider: QuestionnaireProvider;
  questionnaireResponseProvider: QuestionnaireResponseProvider;
  setQuestionnaires: React.Dispatch<React.SetStateAction<Questionnaire[]>>;
  setQuestionnaireResponses: React.Dispatch<React.SetStateAction<QuestionnaireResponse[]>>;
  onQSelectedIndexChange: (index: number) => unknown;
}

function QuestionnairePickerForm(props: Props) {
  const {
    questionnaires,
    setQuestionnaires,
    setQuestionnaireResponses,
    questionnaireProvider,
    questionnaireResponseProvider,
    onQSelectedIndexChange
  } = props;

  const [qHostingIsLocal, setQHostingIsLocal] = useState(true);
  const [searchInput, setSearchInput] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [qIsSearching, setQIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (qHostingIsLocal) {
      setSearchInput('');
      setQuestionnaires(loadQuestionnairesFromLocal());
    }
  }, [qHostingIsLocal]);

  const functionDebounce = useCallback(
    debounce((input: string) => {
      loadQuestionnairesFromServer(`title=${input}`)
        .then((bundle) => {
          setQuestionnaires(bundle.entry ? getQuestionnairesFromBundle(bundle) : []);
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
      <Stack direction="column" spacing={2}>
        <Box display="flex" flexDirection="row">
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h1" fontWeight="bold" fontSize={42} color="inherit" sx={{ mb: 2 }}>
              Questionnaires
            </Typography>
          </Box>
          <Box sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  disabled={qIsSearching}
                  checked={qHostingIsLocal}
                  onChange={() => setQHostingIsLocal(!qHostingIsLocal)}
                />
              }
              label={qHostingIsLocal ? 'Local' : 'Remote'}
            />
          </Box>
        </Box>

        <TextField
          value={searchInput}
          disabled={qHostingIsLocal}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const input = event.target.value;
            setQIsSearching(true);
            setSelectedIndex(null);
            setQuestionnaires([]);
            setQuestionnaireResponses([]);
            setSearchInput(input);
            functionDebounce(input);
          }}
          label="Search Questionnaires"
        />

        <Card elevation={1} sx={{ height: 508 }}>
          <QuestionnairePickerQList
            qHostingIsLocal={qHostingIsLocal}
            questionnaires={questionnaires}
            searchInput={searchInput}
            selectedIndex={selectedIndex}
            qIsSearching={qIsSearching}
            onQSelectedIndexChange={(index) => {
              onQSelectedIndexChange(index);
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
              questionnaireResponseProvider.clearQuestionnaireResponse();
              navigate(`/`);
            }
          }}
          sx={{ borderRadius: 20, py: 1.5, fontSize: 16, textTransform: 'Capitalize' }}>
          Start a new Questionnaire response
          <ArticleIcon sx={{ ml: 1.5 }} />
        </Button>
      </Stack>
    </>
  );
}

export default QuestionnairePickerForm;
