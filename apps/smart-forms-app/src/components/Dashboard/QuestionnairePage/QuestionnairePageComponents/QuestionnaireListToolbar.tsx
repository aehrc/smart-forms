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

import { Box, IconButton, InputAdornment, Tooltip, Typography } from '@mui/material';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import Iconify from '../../../Misc/Iconify';
import { StyledRoot, StyledSearch } from './QuestionnaireListToolbar.styles';
import type { QuestionnaireListItem } from '../../../../interfaces/Interfaces';
import { StyledAlert } from '../../../StyledComponents/Nav.styles';

interface Props {
  selected: QuestionnaireListItem | undefined;
  searchInput: string;
  clearSelection: () => void;
  onSearch: (searchInput: string) => void;
}

function QuestionnaireListToolbar(props: Props) {
  const { selected, searchInput, clearSelection, onSearch } = props;

  const [alertVisible, setAlertVisible] = useState(true);

  return (
    <StyledRoot
      sx={{
        ...(selected && {
          color: 'primary.main',
          bgcolor: 'pale.primary'
        })
      }}>
      {selected ? (
        <Typography component="div" variant="subtitle1">
          {selected.title} selected
        </Typography>
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

      {selected ? (
        <Tooltip title="Clear">
          <IconButton onClick={clearSelection}>
            <Iconify icon="ic:baseline-clear" />
          </IconButton>
        </Tooltip>
      ) : null}
    </StyledRoot>
  );
}

export default QuestionnaireListToolbar;
