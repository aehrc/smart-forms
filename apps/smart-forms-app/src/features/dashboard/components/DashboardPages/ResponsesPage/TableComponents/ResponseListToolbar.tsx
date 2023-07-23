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

import { Box, InputAdornment, LinearProgress, Typography } from '@mui/material';
import Iconify from '../../../../../../components/Iconify/Iconify.tsx';
import {
  getResponseToolBarColors,
  StyledRoot,
  StyledSearch
} from '../../QuestionnairePage/TableComponents/QuestionnaireListToolbar.styles.ts';
import dayjs from 'dayjs';
import type { ChangeEvent } from 'react';
import { useContext } from 'react';
import { SelectedQuestionnaireContext } from '../../../../contexts/SelectedQuestionnaireContext.tsx';
import type { SelectedResponse } from '../../../../types/list.interface.ts';
import BackToQuestionnairesButton from '../Buttons/BackToQuestionnairesButton.tsx';
import ResponseListToolbarButtons from './ResponseListToolbarButtons.tsx';
import useResponsive from '../../../../../../hooks/useResponsive.ts';

interface ResponseListToolbarProps {
  selectedResponse: SelectedResponse | null;
  searchInput: string;
  isFetching: boolean;
  onClearSelection: () => void;
  onSearch: (searchInput: string) => void;
}

function ResponseListToolbar(props: ResponseListToolbarProps) {
  const { selectedResponse, searchInput, isFetching, onClearSelection, onSearch } = props;

  const { selectedQuestionnaire, existingResponses } = useContext(SelectedQuestionnaireContext);

  const isTabletAndUp = useResponsive('up', 'md');

  const selectedQuestionnaireTitle =
    selectedQuestionnaire?.listItem.title ?? 'selected questionnaire';

  const selected = selectedResponse?.listItem;

  const toolBarColors = getResponseToolBarColors(
    selected,
    selectedQuestionnaire,
    existingResponses
  );

  return (
    <>
      <StyledRoot data-test="responses-list-toolbar" sx={{ ...toolBarColors }}>
        {selected ? (
          <Typography component="div" variant="subtitle1">
            {selected.title} — {dayjs(selected.authored).format('LL')} selected
          </Typography>
        ) : selectedQuestionnaire && existingResponses.length > 0 ? (
          <Box display="flex" alignItems="center">
            <BackToQuestionnairesButton />
            <Typography variant="subtitle1">
              Displaying responses from the <b>{selectedQuestionnaireTitle}</b> questionnaire
            </Typography>
          </Box>
        ) : (
          <StyledSearch
            value={searchInput}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onSearch(event.target.value)}
            placeholder="Search responses..."
            startAdornment={
              <InputAdornment position="start">
                <Iconify
                  icon="eva:search-fill"
                  sx={{ color: 'text.disabled', width: 20, height: 20 }}
                />
              </InputAdornment>
            }
            data-test="search-field-responses"
            sx={{
              '&.Mui-focused': {
                width: isTabletAndUp ? `50%` : '320px'
              }
            }}
          />
        )}

        <ResponseListToolbarButtons
          selectedResponse={selectedResponse}
          onClearSelection={onClearSelection}
        />
      </StyledRoot>
      {isFetching ? <LinearProgress /> : <Box pt={0.5} sx={{ ...toolBarColors }} />}
    </>
  );
}

export default ResponseListToolbar;
