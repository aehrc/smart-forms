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

import type { ChangeEvent } from 'react';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import dayjs from 'dayjs';
import { Box, InputAdornment, Typography } from '@mui/material';
import BackToQuestionnairesButton from '../Buttons/BackToQuestionnairesButton.tsx';
import Iconify from '../../../../../../components/Iconify/Iconify.tsx';
import { StyledSearch } from '../../QuestionnairePage/TableComponents/QuestionnaireListToolbar.styles.ts';
import { createResponseListItem } from '../../../../utils/dashboard.ts';
import useResponsive from '../../../../../../hooks/useResponsive.ts';

interface ResponseListToolbarLeftSectionProps {
  selectedResponse: QuestionnaireResponse | null;
  selectedQuestionnaire: Questionnaire | null;
  existingResponses: QuestionnaireResponse[];
  searchInput: string;
  onSearch: (input: string) => void;
}

function ResponseListToolbarLeftSection(props: ResponseListToolbarLeftSectionProps) {
  const { selectedResponse, selectedQuestionnaire, existingResponses, searchInput, onSearch } =
    props;

  const isTabletAndUp = useResponsive('up', 'md');

  if (selectedResponse) {
    const listItem = createResponseListItem(selectedResponse, -1);
    return (
      <Typography component="div" variant="subtitle1">
        {listItem.title} — {dayjs(listItem.authored).format('LL')} selected
      </Typography>
    );
  }

  if (selectedQuestionnaire && existingResponses.length > 0) {
    const selectedQuestionnaireTitle = selectedQuestionnaire?.title ?? 'selected questionnaire';
    return (
      <Box display="flex" alignItems="center">
        <BackToQuestionnairesButton />
        <Typography variant="subtitle1">
          Displaying responses of the <b>{selectedQuestionnaireTitle}</b> questionnaire
        </Typography>
      </Box>
    );
  }

  return (
    <StyledSearch
      value={searchInput}
      onChange={(event: ChangeEvent<HTMLInputElement>) => onSearch(event.target.value)}
      placeholder="Search responses..."
      startAdornment={
        <InputAdornment position="start">
          <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
        </InputAdornment>
      }
      data-test="search-field-responses"
      sx={{
        '&.Mui-focused': {
          width: isTabletAndUp ? `50%` : '320px'
        }
      }}
    />
  );
}

export default ResponseListToolbarLeftSection;
