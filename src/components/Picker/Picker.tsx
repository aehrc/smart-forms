import React from 'react';
import { Box, Divider, Grid, Stack, Typography } from '@mui/material';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import NoQuestionnaireDialog from './NoQuestionnaireDialog';
import { FirstLaunch } from '../../interfaces/Interfaces';
import { PickerSearchField } from './Picker.styles';
import PickerDebugBar from '../QRenderer/DebugComponents/PickerDebugBar';
import usePicker from '../../custom-hooks/usePicker';
import PickerQuestionnaireCard from './PickerQuestionnaireCard';
import PickerQuestionnaireResponseCard from './PickerQuestionnaireResponseCard';

interface Props {
  firstLaunch: FirstLaunch;
}

function Picker(props: Props) {
  const { firstLaunch } = props;
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
    toggleQuestionnaireSource
  } = usePicker(launch);

  return (
    <Box display="flex" flexDirection="column" sx={{ p: 4, height: '100%' }} gap={2.5}>
      <Stack direction="row" gap={8}>
        <Typography variant="h1" fontWeight="bold" fontSize={36}>
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
          label="Search Questionnaires"
          autoFocus
        />
      </Stack>
      <Divider light />
      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        <Grid item xs={12} md={5}>
          <PickerQuestionnaireCard
            searchInput={searchInput}
            questionnaires={questionnaires}
            selectedQuestionnaire={selectedQuestionnaire}
            selectedQuestionnaireIndex={selectedQuestionnaireIndex}
            questionnaireIsSearching={questionnaireIsSearching}
            onQSelectedIndexChange={selectQuestionnaireByIndex}
          />
        </Grid>

        <Grid item xs={12} md={7}>
          <PickerQuestionnaireResponseCard
            questionnaireResponses={questionnaireResponses}
            selectedQuestionnaire={selectedQuestionnaire}
            selectedQuestionnaireResponseIndex={selectedQuestionnaireResponseIndex}
            questionnaireResponseIsSearching={questionnaireResponseIsSearching}
            onQrSelectedIndexChange={selectQuestionnaireResponseByIndex}
          />
        </Grid>
      </Grid>
      <NoQuestionnaireDialog firstLaunch={firstLaunch} />

      <PickerDebugBar
        questionnaireIsSearching={questionnaireIsSearching}
        questionnaireSourceIsLocal={questionnaireSourceIsLocal}
        toggleQuestionnaireSource={toggleQuestionnaireSource}
      />
    </Box>
  );
}

export default Picker;
