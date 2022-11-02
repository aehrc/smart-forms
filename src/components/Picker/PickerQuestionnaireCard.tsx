import { CardOverlineTypography } from '../StyledComponents/Typographys.styles';
import PickerQuestionnaireCardContent from './PickerQuestionnaireCardContent';
import { Box } from '@mui/material';
import { RoundButton } from '../StyledComponents/Buttons.styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { PageType } from '../../interfaces/Enums';
import { FullHeightCard } from '../StyledComponents/Card.styles';
import React from 'react';
import { Questionnaire } from 'fhir/r5';
import { QuestionnaireProviderContext } from '../../App';
import { PageSwitcherContext } from '../../custom-contexts/PageSwitcherContext';

interface Props {
  searchInput: string;
  questionnaires: Questionnaire[];
  selectedQuestionnaire: Questionnaire | null;
  selectedQuestionnaireIndex: number | null;
  questionnaireIsSearching: boolean;
  onQSelectedIndexChange: (index: number) => unknown;
}

function PickerQuestionnaireCard(props: Props) {
  const {
    searchInput,
    questionnaires,
    selectedQuestionnaire,
    selectedQuestionnaireIndex,
    questionnaireIsSearching,
    onQSelectedIndexChange
  } = props;
  const questionnaireProvider = React.useContext(QuestionnaireProviderContext);
  const pageSwitcher = React.useContext(PageSwitcherContext);

  function handleCreateNewResponseButtonClick() {
    if (typeof selectedQuestionnaireIndex === 'number' && selectedQuestionnaire) {
      questionnaireProvider.setQuestionnaire(selectedQuestionnaire);
      pageSwitcher.goToPage(PageType.Renderer);
    }
  }

  return (
    <FullHeightCard>
      <CardOverlineTypography variant="overline">Questionnaires</CardOverlineTypography>
      <PickerQuestionnaireCardContent
        searchInput={searchInput}
        questionnaires={questionnaires}
        selectedQuestionnaireIndex={selectedQuestionnaireIndex}
        questionnaireIsSearching={questionnaireIsSearching}
        onQSelectedIndexChange={onQSelectedIndexChange}
      />
      <Box sx={{ flexGrow: 1 }}></Box>
      <Box display="flex" flexDirection="row-reverse">
        <RoundButton
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          disabled={typeof selectedQuestionnaireIndex !== 'number'}
          onClick={() => handleCreateNewResponseButtonClick()}
          sx={{ m: 1.5, textTransform: 'Capitalize' }}>
          Create new response
        </RoundButton>
      </Box>
    </FullHeightCard>
  );
}
export default PickerQuestionnaireCard;
