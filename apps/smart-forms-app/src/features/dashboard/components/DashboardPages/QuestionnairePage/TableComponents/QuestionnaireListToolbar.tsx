/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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

import { Box, InputAdornment, Typography } from '@mui/material';

import type { ChangeEvent } from 'react';
import { useState } from 'react';
import Iconify from '../../../../../../components/Iconify/Iconify.tsx';
import {
  getQuestionnaireToolBarColors,
  StyledRoot,
  StyledSearch
} from './QuestionnaireListToolbar.styles.ts';
import { StyledAlert } from '../../../../../../components/Nav/Nav.styles.ts';
import QuestionnaireListToolbarButtons from './QuestionnaireListToolbarButtons.tsx';
import type { Questionnaire } from 'fhir/r4';

interface QuestionnaireListToolbarProps {
  selected: Questionnaire | null;
  searchInput: string;
  onClearSelection: () => void;
  onSearch: (searchInput: string) => void;
}

function QuestionnaireListToolbar(props: QuestionnaireListToolbarProps) {
  const { selected, searchInput, onClearSelection, onSearch } = props;

  const [alertVisible, setAlertVisible] = useState(true);

  const toolBarColors = getQuestionnaireToolBarColors(selected);

  return (
    <StyledRoot sx={{ ...toolBarColors }}>
      {selected ? (
        <Typography variant="subtitle1">{selected.title ?? 'Undefined title'} selected</Typography>
      ) : (
        <StyledSearch
          value={searchInput}
          onFocus={() => setAlertVisible(false)}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onSearch(event.target.value)}
          placeholder="Search questionnaires..."
          startAdornment={
            <InputAdornment position="start">
              <Iconify
                icon="eva:search-fill"
                sx={{ color: 'text.disabled', width: 20, height: 20 }}
              />
            </InputAdornment>
          }
          data-test="search-field-questionnaires"
        />
      )}
      {alertVisible && !selected ? (
        <StyledAlert color="info">
          <Box>
            <Typography variant="subtitle2">
              {'Looking for something else? Refine your search in the search bar.'}
            </Typography>
          </Box>
        </StyledAlert>
      ) : null}

      {selected ? <QuestionnaireListToolbarButtons onClearSelection={onClearSelection} /> : null}
    </StyledRoot>
  );
}

export default QuestionnaireListToolbar;
