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

import type { ChangeEvent, SyntheticEvent } from 'react';
import { useState } from 'react';
import useFetchQuestionnaires from '../../../../hooks/useFetchQuestionnaires.ts';
import Autocomplete from '@mui/material/Autocomplete';
import type { Questionnaire } from 'fhir/r4';
import { InputAdornment, TextField } from '@mui/material';
import { createResponseSearchOption } from '../../../../utils/dashboard.ts';
import { useDebounce } from 'usehooks-ts';
import { useTheme } from '@mui/material/styles';
import { getResponseSearchStyles } from '../../QuestionnairePage/TableComponents/QuestionnaireListToolbar.styles.ts';
import Iconify from '../../../../../../components/Iconify/Iconify.tsx';

interface ResponseListToolbarSearchProps {
  searchedQuestionnaire: Questionnaire | null;
  onChangeQuestionnaire: (searched: Questionnaire | null) => void;
}

function ResponseListToolbarSearch(props: ResponseListToolbarSearchProps) {
  const { searchedQuestionnaire, onChangeQuestionnaire } = props;

  const [input, setInput] = useState('');
  const debouncedInput = useDebounce(input, 300);

  const { questionnaires, isFetching } = useFetchQuestionnaires(input, debouncedInput, 2);

  const theme = useTheme();

  // Event handlers
  function handleValueChange(
    _: SyntheticEvent<Element, Event>,
    newQuestionnaire: Questionnaire | null
  ) {
    onChangeQuestionnaire(newQuestionnaire);
    if (newQuestionnaire === null) {
      setInput('');
      return;
    }
  }

  return (
    <Autocomplete
      value={searchedQuestionnaire ?? null}
      options={questionnaires}
      getOptionLabel={(questionnaire) => createResponseSearchOption(questionnaire)}
      loading={isFetching}
      loadingText="Fetching results..."
      noOptionsText="No results... yet."
      clearOnEscape
      autoHighlight
      onChange={handleValueChange}
      fullWidth
      sx={{
        maxWidth: 400,
        ...getResponseSearchStyles(theme)
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search responses..."
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <Iconify
                  icon="eva:search-fill"
                  sx={{ color: 'text.disabled', width: 20, height: 20 }}
                />
              </InputAdornment>
            )
          }}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
        />
      )}
    />
  );
}

export default ResponseListToolbarSearch;
