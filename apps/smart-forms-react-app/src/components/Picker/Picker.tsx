import React from 'react';
import { Box, Divider, Grid, Stack, Typography } from '@mui/material';
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
import { Operation } from '../../interfaces/Enums';
import PickerOperationButtons from '../OperationButtons/PickerOperationButtons';

function Picker() {
  const launch = React.useContext(LaunchContext);

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
    toggleQuestionnaireSource,
    refreshQuestionnaireList
  } = usePicker(launch);

  return (
    <Grid container>
      <SideBarGrid item lg={1.75}>
        <SideBar>
          <PickerOperationButtons
            buttonOrChip={Operation.Button}
            refreshQuestionnaireList={refreshQuestionnaireList}
          />
        </SideBar>
      </SideBarGrid>
      <MainGrid item lg={10.25}>
        <MainGridContainerBox gap={2.5}>
          <Stack direction="row" gap={8}>
            <Typography fontWeight="bold" fontSize={36}>
              Questionnaires
            </Typography>

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
          />
          <ChipBar>
            <PickerOperationButtons
              buttonOrChip={Operation.Chip}
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
                onQrSelectedIndexChange={selectQuestionnaireResponseByIndex}
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
