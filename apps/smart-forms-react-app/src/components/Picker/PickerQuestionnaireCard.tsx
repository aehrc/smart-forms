import { SideBarOverlineTypography } from '../StyledComponents/Typographys.styles';
import PickerQuestionnaireCardContent from './PickerQuestionnaireCardContent';
import { Box } from '@mui/material';
import { RoundButton } from '../StyledComponents/Buttons.styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { PageType } from '../../interfaces/Enums';
import { FullHeightCard } from '../StyledComponents/Card.styles';
import React, { useContext } from 'react';
import { Questionnaire } from 'fhir/r5';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../App';
import { PageSwitcherContext } from '../../custom-contexts/PageSwitcherContext';
import { createQuestionnaireResponse } from '../../functions/QrItemFunctions';
import { LaunchContext } from '../../custom-contexts/LaunchContext';

interface Props {
  searchInput: string;
  questionnaires: Questionnaire[];
  selectedQuestionnaire: Questionnaire | null;
  selectedQuestionnaireIndex: number | null;
  questionnaireIsSearching: boolean;
  questionnaireSourceIsLocal: boolean;
  onQSelectedIndexChange: (index: number) => unknown;
}

function PickerQuestionnaireCard(props: Props) {
  const {
    searchInput,
    questionnaires,
    selectedQuestionnaire,
    selectedQuestionnaireIndex,
    questionnaireIsSearching,
    questionnaireSourceIsLocal,
    onQSelectedIndexChange
  } = props;
  const questionnaireProvider = React.useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = React.useContext(QuestionnaireResponseProviderContext);
  const pageSwitcher = React.useContext(PageSwitcherContext);
  const launch = useContext(LaunchContext);

  function handleCreateNewResponseButtonClick() {
    if (typeof selectedQuestionnaireIndex === 'number' && selectedQuestionnaire) {
      questionnaireProvider.setQuestionnaire(
        selectedQuestionnaire,
        questionnaireSourceIsLocal,
        launch.fhirClient
      );
      if (selectedQuestionnaire.item && selectedQuestionnaire.item.length > 0) {
        questionnaireResponseProvider.setQuestionnaireResponse(
          createQuestionnaireResponse(selectedQuestionnaire.id, selectedQuestionnaire.item[0])
        );
      }

      pageSwitcher.goToPage(PageType.Renderer);
    }
  }

  return (
    <FullHeightCard>
      <SideBarOverlineTypography variant="overline">Questionnaires</SideBarOverlineTypography>
      <PickerQuestionnaireCardContent
        searchInput={searchInput}
        questionnaires={questionnaires}
        selectedQuestionnaireIndex={selectedQuestionnaireIndex}
        questionnaireIsSearching={questionnaireIsSearching}
        questionnaireSourceIsLocal={questionnaireSourceIsLocal}
        onQSelectedIndexChange={onQSelectedIndexChange}
      />
      <Box sx={{ flexGrow: 1 }}></Box>
      <Box display="flex" flexDirection="row-reverse">
        <RoundButton
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          disabled={typeof selectedQuestionnaireIndex !== 'number'}
          onClick={handleCreateNewResponseButtonClick}
          sx={{ m: 1.5, textTransform: 'Capitalize' }}>
          Create new response
        </RoundButton>
      </Box>
    </FullHeightCard>
  );
}
export default PickerQuestionnaireCard;
