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

import React, { useContext } from 'react';
import { Box, Divider, Grid, Stack } from '@mui/material';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import { PickerSearchField } from './Picker.styles';
import PickerDebugBar from '../DebugComponents/PickerDebugBar';
import usePicker from '../../custom-hooks/usePicker';
import PickerQuestionnaireCard from './PickerQuestionnaireCard';
import PickerQuestionnaireResponseCard from './PickerQuestionnaireResponseCard';
import { MainGridContainerBox } from '../StyledComponents/Boxes.styles';
import { MainGrid, SideBarGrid } from '../StyledComponents/Grids.styles';
import SideBar from '../SideBar/SideBar';
import ChipBar from '../ChipBar/ChipBar';
import PickerOperationButtons from '../OperationButtons/PickerOperationButtons';
import { MainGridHeadingTypography } from '../StyledComponents/Typographys.styles';
import { SideBarContext } from '../../custom-contexts/SideBarContext';

function Picker() {
  const launch = useContext(LaunchContext);
  const { sideBarIsExpanded } = useContext(SideBarContext);

  const {
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
    selectQuestionnaireByIndex,
    selectQuestionnaireResponseByIndex,
    sortQuestionnaireResponses,
    toggleQuestionnaireSource,
    refreshQuestionnaireList
  } = usePicker(launch);

  return (
    <Grid container>
      <SideBarGrid item xs={12} lg={sideBarIsExpanded ? 1.75 : 0.5}>
        <SideBar>
          <PickerOperationButtons refreshQuestionnaireList={refreshQuestionnaireList} />
        </SideBar>
      </SideBarGrid>
      <MainGrid item xs={12} lg={sideBarIsExpanded ? 10.25 : 11.5}>
        <MainGridContainerBox>
          <Stack direction="row" gap={8} alignItems="center">
            <MainGridHeadingTypography variant="h2">Questionnaires</MainGridHeadingTypography>

            <PickerSearchField
              fullWidth
              size="small"
              value={searchInput}
              disabled={questionnaireSourceIsLocal}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                handleSearchInputChange(event.target.value)
              }
              sx={{ display: { xs: 'none', md: 'flex' } }}
              label="Search Questionnaires"
              autoFocus
              data-test="picker-search-field-desktop"
            />
          </Stack>

          <PickerSearchField
            fullWidth
            size="small"
            value={searchInput}
            disabled={questionnaireSourceIsLocal}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              handleSearchInputChange(event.target.value)
            }
            sx={{ display: { xs: 'flex', md: 'none' } }}
            label="Search Questionnaires"
            autoFocus
            data-test="picker-search-field-mobile"
          />
          <ChipBar>
            <PickerOperationButtons
              isChip={true}
              refreshQuestionnaireList={refreshQuestionnaireList}
            />
          </ChipBar>
          <Divider light />
          <Grid container spacing={3} sx={{ flexGrow: 1 }}>
            <Grid item xs={12} md={5}>
              <PickerQuestionnaireCard
                searchInput={searchInput}
                questionnaires={questionnaires}
                selectedQuestionnaire={selectedQuestionnaire}
                selectedQuestionnaireIndex={selectedQuestionnaireIndex}
                questionnaireIsSearching={questionnaireIsSearching}
                questionnaireSourceIsLocal={questionnaireSourceIsLocal}
                onQSelectedIndexChange={selectQuestionnaireByIndex}
              />
            </Grid>

            <Grid item xs={12} md={7}>
              <PickerQuestionnaireResponseCard
                questionnaireResponses={questionnaireResponses}
                selectedQuestionnaire={selectedQuestionnaire}
                selectedQuestionnaireIndex={selectedQuestionnaireIndex}
                selectedQuestionnaireResponseIndex={selectedQuestionnaireResponseIndex}
                questionnaireResponseIsSearching={questionnaireResponseIsSearching}
                questionnaireSourceIsLocal={questionnaireSourceIsLocal}
                onQrSelectedIndexChange={selectQuestionnaireResponseByIndex}
                onQrSortByParamChange={sortQuestionnaireResponses}
              />
            </Grid>
          </Grid>

          <Box sx={{ pb: 2 }}></Box>

          <PickerDebugBar
            questionnaireIsSearching={questionnaireIsSearching}
            questionnaireSourceIsLocal={questionnaireSourceIsLocal}
            toggleQuestionnaireSource={toggleQuestionnaireSource}
          />
        </MainGridContainerBox>
      </MainGrid>
    </Grid>
  );
}

export default Picker;
