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

import { Questionnaire } from 'fhir/r5';
import React from 'react';
import { AlertTitle, ListItemButton, ListItemText } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import { PrimarySelectableList } from '../StyledComponents/Lists.styles';
import PickerSkeletonList from './PickerSkeletonList';
import { PickerAlert } from '../StyledComponents/Alert.styles';

interface Props {
  searchInput: string;
  questionnaires: Questionnaire[];
  selectedQuestionnaireIndex: number | null;
  questionnaireIsSearching: boolean;
  questionnaireSourceIsLocal: boolean;
  onQSelectedIndexChange: (index: number) => unknown;
}

function PickerQuestionnaireCardContent(props: Props) {
  const {
    searchInput,
    questionnaires,
    selectedQuestionnaireIndex,
    questionnaireIsSearching,
    questionnaireSourceIsLocal,
    onQSelectedIndexChange
  } = props;

  if (questionnaireIsSearching) {
    return <PickerSkeletonList />;
  } else if (questionnaires.length === 0) {
    if (searchInput === '') {
      return (
        <PickerAlert severity="info">
          Enter a questionnaire title in the search bar above to load results.
        </PickerAlert>
      );
    } else {
      return (
        <PickerAlert severity="warning">
          <AlertTitle>No questionnaires found</AlertTitle>
          <div>
            {`We didn't manage to find anything from the search terms - `}
            <b>{searchInput}</b>.
          </div>
          <div>Try searching for something else.</div>
        </PickerAlert>
      );
    }
  } else {
    return (
      <>
        {searchInput === '' && !questionnaireSourceIsLocal ? (
          <PickerAlert severity="info" sx={{ mb: 1 }} data-test="picker-alert-refine">
            Looking for something else? Refine your search in the search bar above.
          </PickerAlert>
        ) : null}
        <PrimarySelectableList data-test="picker-questionnaire-list">
          {questionnaires.map((questionnaire, i) => (
            <ListItemButton
              key={questionnaire.id}
              selected={selectedQuestionnaireIndex === i}
              sx={{ py: 1, px: 2.5 }}
              onClick={() => {
                onQSelectedIndexChange(i);
              }}>
              <ArticleIcon sx={{ mr: 2 }} />
              <ListItemText
                primary={`${questionnaire.title}`}
                primaryTypographyProps={{ variant: 'subtitle2' }}
              />
            </ListItemButton>
          ))}
        </PrimarySelectableList>
      </>
    );
  }
}

export default PickerQuestionnaireCardContent;
