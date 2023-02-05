/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useCallback, useEffect, useState } from 'react';
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
import {
  sortByAuthorName,
  sortByLastUpdated,
  sortByQuestionnaireName,
  sortByStatus
} from '../functions/QrSortFunctions';
import { QrSortParam } from '../interfaces/Enums';

function usePicker(launch: LaunchContextType) {
  const [questionnaireSourceIsLocal, setQuestionnaireSourceIsLocal] = useState(!launch.fhirClient);

  const initialQuestionnaires = questionnaireSourceIsLocal ? loadQuestionnairesFromLocal() : [];
  const initialQuestionnaireIsSearching = !questionnaireSourceIsLocal;

  const [searchInput, setSearchInput] = useState<string>('');
  const [questionnaireIsSearching, setQuestionnaireIsSearching] = useState(
    initialQuestionnaireIsSearching
  );
  const [questionnaireResponseIsSearching, setQuestionnaireResponseIsSearching] = useState(true);

  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>(initialQuestionnaires);
  const [questionnaireResponses, setQuestionnaireResponses] = useState<QuestionnaireResponse[]>([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [selectedQuestionnaireIndex, setSelectedQuestionnaireIndex] = useState<number | null>(null);
  const [selectedQuestionnaireResponseIndex, setSelectedQuestionnaireResponseIndex] = useState<
    number | null
  >(null);

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
      setQuestionnaireIsSearching(false);
      setQuestionnaireResponseIsSearching(false);
    } else {
      if (launch.fhirClient) {
        // fetch questionnaires and questionnaireResponses from remote
        setQuestionnaireIsSearching(true);
        loadQuestionnairesFromServer(launch.fhirClient)
          .then((bundle) => {
            setQuestionnaires(bundle.entry ? getQuestionnairesFromBundle(bundle) : []);
            setQuestionnaireIsSearching(false);
          })
          .catch(() => setQuestionnaireIsSearching(false));
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
      if (launch.fhirClient) {
        loadQuestionnairesFromServer(launch.fhirClient, input)
          .then((bundle) => {
            setQuestionnaires(bundle.entry ? getQuestionnairesFromBundle(bundle) : []);
            setQuestionnaireIsSearching(false);
            setQuestionnaireResponseIsSearching(false);
          })
          .catch(() => {
            setQuestionnaireIsSearching(false);
            setQuestionnaireResponseIsSearching(false);
          });
      }
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

  function sortQuestionnaireResponses(sortByParam: string) {
    let sortedQuestionnaireResponses: QuestionnaireResponse[] = [];

    switch (sortByParam) {
      case QrSortParam.QuestionnaireName:
        sortedQuestionnaireResponses = sortByQuestionnaireName([...questionnaireResponses]);
        break;
      case QrSortParam.AuthorName:
        sortedQuestionnaireResponses = sortByAuthorName([...questionnaireResponses]);
        break;
      case QrSortParam.LastUpdated:
        sortedQuestionnaireResponses = sortByLastUpdated([...questionnaireResponses]);
        break;
      case QrSortParam.Status:
        sortedQuestionnaireResponses = sortByStatus([...questionnaireResponses]);
        break;
    }
    setQuestionnaireResponses(sortedQuestionnaireResponses);
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
    sortQuestionnaireResponses,
    toggleQuestionnaireSource,
    refreshQuestionnaireList
  };
}

export default usePicker;
