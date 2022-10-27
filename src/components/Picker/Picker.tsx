import React from 'react';
import { Box, Grid, Stack, Typography } from '@mui/material';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import NoQuestionnaireDialog from './NoQuestionnaireDialog';
import { FirstLaunch } from '../../interfaces/Interfaces';
import { PickerSearchField } from './Picker.styles';
import PickerDebugBar from '../QRenderer/DebugComponents/PickerDebugBar';
import usePicker from '../../custom-hooks/usePicker';
import { CardOverlineTypography } from '../StyledComponents/Typographys.styles';
import PickerQuestionnaireCardContent from './PickerQuestionnaireCardContent';
import { FullHeightCard } from '../StyledComponents/Card.styles';
import { RoundButton } from '../StyledComponents/Buttons.styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PickerQuestionnaireResponseCardContent from './PickerQuestionnaireResponseCardContent';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../App';
import { PageSwitcherContext } from '../../custom-contexts/PageSwitcherContext';
import { PageType } from '../../interfaces/Enums';

interface Props {
  firstLaunch: FirstLaunch;
}

function Picker(props: Props) {
  const { firstLaunch } = props;
  const questionnaireProvider = React.useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = React.useContext(QuestionnaireResponseProviderContext);
  const pageSwitcher = React.useContext(PageSwitcherContext);
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
    <Box display="flex" flexDirection="column" sx={{ p: 5, height: '100%' }} gap={3}>
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
      <Grid container spacing={4} sx={{ flexGrow: 1 }}>
        <Grid item xs={12} md={5}>
          <FullHeightCard>
            <CardOverlineTypography variant="overline">Questionnaires</CardOverlineTypography>
            <PickerQuestionnaireCardContent
              searchInput={searchInput}
              questionnaires={questionnaires}
              selectedQuestionnaireIndex={selectedQuestionnaireIndex}
              questionnaireIsSearching={questionnaireIsSearching}
              onQSelectedIndexChange={selectQuestionnaireByIndex}
            />
            <Box sx={{ flexGrow: 1 }}></Box>
            <Box display="flex" flexDirection="row-reverse">
              <RoundButton
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                disabled={typeof selectedQuestionnaireIndex !== 'number'}
                onClick={() => {
                  if (typeof selectedQuestionnaireIndex === 'number' && selectedQuestionnaire) {
                    questionnaireProvider.setQuestionnaire(selectedQuestionnaire);
                    questionnaireResponseProvider.setQuestionnaireResponse(
                      questionnaireResponses[selectedQuestionnaireIndex]
                    );
                    pageSwitcher.goToPage(PageType.Renderer);
                  }
                }}
                sx={{ m: 1.5, textTransform: 'Capitalize' }}>
                Create new response
              </RoundButton>
            </Box>
          </FullHeightCard>
        </Grid>

        <Grid item xs={12} md={7}>
          <FullHeightCard>
            <CardOverlineTypography variant="overline">Responses</CardOverlineTypography>
            <PickerQuestionnaireResponseCardContent
              launch={launch}
              questionnaireResponses={questionnaireResponses}
              selectedQuestionnaireResponseIndex={selectedQuestionnaireResponseIndex}
              questionnaireResponseIsSearching={questionnaireResponseIsSearching}
              onQrSelectedIndexChange={selectQuestionnaireResponseByIndex}
            />

            <Box sx={{ flexGrow: 1 }}></Box>
            <Box display="flex" flexDirection="row-reverse">
              <RoundButton
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                disabled={
                  typeof selectedQuestionnaireResponseIndex !== 'number' || !selectedQuestionnaire
                }
                onClick={() => {
                  if (
                    typeof selectedQuestionnaireResponseIndex === 'number' &&
                    selectedQuestionnaire
                  ) {
                    questionnaireProvider.setQuestionnaire(selectedQuestionnaire);
                    questionnaireResponseProvider.setQuestionnaireResponse(
                      questionnaireResponses[selectedQuestionnaireResponseIndex]
                    );

                    pageSwitcher.goToPage(PageType.ResponsePreview);
                  }
                }}
                sx={{ m: 1.5, textTransform: 'Capitalize' }}>
                View response
              </RoundButton>
            </Box>
          </FullHeightCard>
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
