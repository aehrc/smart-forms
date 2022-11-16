import { useState, useEffect, useCallback } from 'react';
import { Questionnaire, QuestionnaireResponse } from 'fhir/r5';
import {
  getQResponsesFromBundle,
  getQuestionnairesFromBundle,
  loadQuestionnaireResponsesFromServer,
  loadQuestionnairesFromLocal,
  loadQuestionnairesFromServer
} from '../functions/LoadServerResourceFunctions';
import { debounce } from 'lodash';
import { LaunchContextType } from '../interfaces/ContextTypes';

function usePicker(launch: LaunchContextType) {
  const [searchInput, setSearchInput] = useState<string>('');
  const [questionnaireIsSearching, setQuestionnaireIsSearching] = useState(true);
  const [questionnaireResponseIsSearching, setQuestionnaireResponseIsSearching] = useState(true);

  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [questionnaireResponses, setQuestionnaireResponses] = useState<QuestionnaireResponse[]>([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [selectedQuestionnaireIndex, setSelectedQuestionnaireIndex] = useState<number | null>(null);
  const [selectedQuestionnaireResponseIndex, setSelectedQuestionnaireResponseIndex] = useState<
    number | null
  >(null);

  const [questionnaireSourceIsLocal, setQuestionnaireSourceIsLocal] = useState(false);

  // determine if questionnaires are fetched from local or remote
  useEffect(() => {
    initializeQuestionnaireList();
  }, [questionnaireSourceIsLocal]);

  function handleSearchInputChange(input: string) {
    setQuestionnaireIsSearching(true);
    setSearchInput(input);
    resetPickerState();
    if (input !== '') {
      searchQuestionnaireWithDebounce(input);
    } else {
      setQuestionnaireIsSearching(false);
    }
  }

  function initializeQuestionnaireList() {
    setSearchInput('');
    resetPickerState();
    if (questionnaireSourceIsLocal) {
      setQuestionnaires(loadQuestionnairesFromLocal());
    } else {
      // fetch questionnaires and questionnaireResponses from remote
      setQuestionnaireIsSearching(true);
      loadQuestionnairesFromServer()
        .then((bundle) => {
          setQuestionnaires(bundle.entry ? getQuestionnairesFromBundle(bundle) : []);
          setQuestionnaireIsSearching(false);
        })
        .catch(() => setQuestionnaireIsSearching(false));

      if (launch.fhirClient) {
        setQuestionnaireResponseIsSearching(true);
        loadQuestionnaireResponsesFromServer(launch.fhirClient, launch.patient)
          .then((bundle) => {
            setQuestionnaireResponses(bundle.entry ? getQResponsesFromBundle(bundle) : []);
            setQuestionnaireResponseIsSearching(false);
          })
          .catch(() => setQuestionnaireIsSearching(false));
      }
    }
  }

  function resetPickerState() {
    setSelectedQuestionnaireIndex(null);
    setSelectedQuestionnaireResponseIndex(null);
    setQuestionnaires([]);
    setQuestionnaireResponses([]);
  }

  // search questionnaires from input with delay
  const searchQuestionnaireWithDebounce = useCallback(
    debounce((input: string) => {
      loadQuestionnairesFromServer(input)
        .then((bundle) => {
          setQuestionnaires(bundle.entry ? getQuestionnairesFromBundle(bundle) : []);
          setQuestionnaireIsSearching(false);
          setQuestionnaireResponseIsSearching(false);
        })
        .catch(() => {
          setQuestionnaireIsSearching(false);
          setQuestionnaireResponseIsSearching(false);
        });
    }, 500),
    []
  );

  function selectQuestionnaireByIndex(index: number) {
    const selectedQuestionnaire = questionnaires[index];
    const selectedQuestionnaireId = selectedQuestionnaire.id;

    if (!selectedQuestionnaireId) return null;

    if (launch.fhirClient) {
      setQuestionnaireResponseIsSearching(true);
      loadQuestionnaireResponsesFromServer(
        launch.fhirClient,
        launch.patient,
        selectedQuestionnaireId
      )
        .then((bundle) => {
          setQuestionnaireResponses(bundle.entry ? getQResponsesFromBundle(bundle) : []);
          setQuestionnaireResponseIsSearching(false);
        })
        .catch(() => setQuestionnaireResponseIsSearching(false));
    }
    setSelectedQuestionnaireIndex(index);
    setSelectedQuestionnaire(selectedQuestionnaire);
  }

  function selectQuestionnaireResponseByIndex(index: number) {
    const selectedQResponse = questionnaireResponses[index];

    if (selectedQResponse.id) {
      setSelectedQuestionnaireResponseIndex(index);
    }
  }

  function toggleQuestionnaireSource() {
    setQuestionnaireSourceIsLocal(!questionnaireSourceIsLocal);
  }

  function refreshQuestionnaireList() {
    initializeQuestionnaireList();
  }

  return {
    searchInput,
    questionnaireIsSearching,
    questionnaireResponseIsSearching,
    questionnaires,
    questionnaireResponses,
    selectedQuestionnaire,
    selectedQuestionnaireIndex,
    selectedQuestionnaireResponseIndex,
    questionnaireSourceIsLocal,
    handleSearchInputChange,
    searchQuestionnaireWithDebounce,
    selectQuestionnaireByIndex,
    selectQuestionnaireResponseByIndex,
    toggleQuestionnaireSource,
    refreshQuestionnaireList
  };
}

export default usePicker;
