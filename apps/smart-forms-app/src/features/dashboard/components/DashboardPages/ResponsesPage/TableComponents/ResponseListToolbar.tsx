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

import {
  Box,
  IconButton,
  InputAdornment,
  LinearProgress,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import Iconify from '../../../../../../components/Iconify/Iconify.tsx';
import {
  getToolBarColors,
  StyledRoot,
  StyledSearch
} from '../../QuestionnairePage/TableComponents/QuestionnaireListToolbar.styles.ts';
import dayjs from 'dayjs';
import type { ChangeEvent } from 'react';
import { useContext } from 'react';
import { SelectedQuestionnaireContext } from '../../../../contexts/SelectedQuestionnaireContext.tsx';
import { constructName } from '../../../../../smartAppLaunch/utils/launchContext.ts';
import type { ResponseListItem } from '../../../../types/list.interface.ts';
import useConfigStore from '../../../../../../stores/useConfigStore.ts';

interface Props {
  selected: ResponseListItem | undefined;
  searchInput: string;
  isFetching: boolean;
  clearSelection: () => void;
  onSearch: (searchInput: string) => void;
}

function ResponseListToolbar(props: Props) {
  const { selected, searchInput, isFetching, clearSelection, onSearch } = props;

  const { selectedQuestionnaire, existingResponses, clearSelectedQuestionnaire } = useContext(
    SelectedQuestionnaireContext
  );
  const patient = useConfigStore((state) => state.patient);
  const theme = useTheme();

  const selectedQuestionnaireTitle =
    selectedQuestionnaire?.listItem.title ?? 'selected questionnaire';

  const toolBarColors = getToolBarColors(selected, selectedQuestionnaire, existingResponses);

  return (
    <>
      <StyledRoot data-test="responses-list-toolbar" sx={{ ...toolBarColors }}>
        {selected ? (
          <Typography component="div" variant="subtitle1">
            {selected.title} — {dayjs(selected.authored).format('LL')} selected
          </Typography>
        ) : selectedQuestionnaire && existingResponses.length > 0 ? (
          <Typography variant="subtitle1">
            Displaying responses from the <b>{selectedQuestionnaireTitle}</b> questionnaire
          </Typography>
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
                width: '50%',
                boxShadow: theme.customShadows.z4
              }
            }}
          />
        )}

        {selected ? (
          <Tooltip title="Clear">
            <IconButton onClick={clearSelection}>
              <Iconify icon="ic:baseline-clear" />
            </IconButton>
          </Tooltip>
        ) : selectedQuestionnaire && existingResponses.length > 0 ? (
          <Tooltip title="Remove questionnaire filter">
            <IconButton
              onClick={() => clearSelectedQuestionnaire()}
              data-test="button-remove-questionnaire-filter">
              <Iconify icon="material-symbols:filter-alt-off-outline" />
            </IconButton>
          </Tooltip>
        ) : (
          <Typography variant="subtitle1">
            Showing responses for <b>{constructName(patient?.name)}</b>
          </Typography>
        )}
      </StyledRoot>
      {isFetching ? <LinearProgress /> : <Box pt={0.5} sx={{ ...toolBarColors }} />}
    </>
  );
}

export default ResponseListToolbar;
