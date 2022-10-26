import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Box, Card, FormControlLabel, Stack, Switch, TextField, Typography } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import { Questionnaire, QuestionnaireResponse } from 'fhir/r5';
import { debounce } from 'lodash';
import {
  getQuestionnairesFromBundle,
  loadQuestionnairesFromLocal,
  loadQuestionnairesFromServer
} from '../../functions/LoadServerResourceFunctions';
import QuestionnairePickerQList from './QuestionnairePickerQList';
import { RoundButton } from '../StyledComponents/StyledComponents.styles';
import { QuestionnaireActiveContext } from '../../custom-contexts/QuestionnaireActiveContext';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../App';

interface Props {
  questionnaires: Questionnaire[];
  setQuestionnaires: React.Dispatch<React.SetStateAction<Questionnaire[]>>;
  setQuestionnaireResponses: React.Dispatch<React.SetStateAction<QuestionnaireResponse[]>>;
  onQSelectedIndexChange: (index: number) => unknown;
}

function QuestionnairePickerForm(props: Props) {
  const { questionnaires, setQuestionnaires, setQuestionnaireResponses, onQSelectedIndexChange } =
    props;

  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = useContext(QuestionnaireResponseProviderContext);
  const questionnaireActive = useContext(QuestionnaireActiveContext);

  const [qHostingIsLocal, setQHostingIsLocal] = useState(false);
  const [searchInput, setSearchInput] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [qIsSearching, setQIsSearching] = useState(false);

  useEffect(() => {
    if (qHostingIsLocal) {
      setSearchInput('');
      setQuestionnaires(loadQuestionnairesFromLocal());
    } else {
      setQIsSearching(true);
      loadQuestionnairesFromServer()
        .then((bundle) => {
          setQuestionnaires(bundle.entry ? getQuestionnairesFromBundle(bundle) : []);
          setQIsSearching(false);
        })
        .catch((error) => {
          console.log(error);
          setQIsSearching(false);
        });
    }
  }, [qHostingIsLocal]);

  const searchQuestionnaireWithDebounce = useCallback(
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
            searchQuestionnaireWithDebounce(input);
          }}
          label="Search Questionnaires"
        />

        <Card elevation={1} sx={{ height: '50vh' }}>
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

        <RoundButton
          variant="outlined"
          startIcon={<ArticleIcon />}
          disabled={typeof selectedIndex !== 'number'}
          onClick={() => {
            if (typeof selectedIndex === 'number') {
              questionnaireProvider.setQuestionnaire(questionnaires[selectedIndex]);
              questionnaireResponseProvider.clearQuestionnaireResponse();

              questionnaireActive.setQuestionnaireActive(true);
            }
          }}
          sx={{ py: 1.5, fontSize: 16, textTransform: 'Capitalize' }}>
          Start a new Questionnaire response
        </RoundButton>
      </Stack>
    </>
  );
}

export default QuestionnairePickerForm;
