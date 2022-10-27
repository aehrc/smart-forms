import { Questionnaire, QuestionnaireResponse } from 'fhir/r5';
import React, { useContext } from 'react';
import { Box } from '@mui/material';
import { CardOverlineTypography } from '../StyledComponents/Typographys.styles';
import PickerQuestionnaireResponseCardContent from './PickerQuestionnaireResponseCardContent';
import { RoundButton } from '../StyledComponents/Buttons.styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { PageType } from '../../interfaces/Enums';
import { FullHeightCard } from '../StyledComponents/Card.styles';
import { PageSwitcherContext } from '../../custom-contexts/PageSwitcherContext';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../App';

interface Props {
  questionnaireResponses: QuestionnaireResponse[];
  selectedQuestionnaire: Questionnaire | null;
  selectedQuestionnaireResponseIndex: number | null;
  questionnaireResponseIsSearching: boolean;
  onQrSelectedIndexChange: (index: number) => unknown;
}

function PickerQuestionnaireResponseCard(props: Props) {
  const {
    questionnaireResponses,
    selectedQuestionnaire,
    selectedQuestionnaireResponseIndex,
    questionnaireResponseIsSearching,
    onQrSelectedIndexChange
  } = props;
  const questionnaireProvider = React.useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = React.useContext(QuestionnaireResponseProviderContext);
  const pageSwitcher = useContext(PageSwitcherContext);

  return (
    <FullHeightCard>
      <CardOverlineTypography variant="overline">Responses</CardOverlineTypography>
      <PickerQuestionnaireResponseCardContent
        questionnaireResponses={questionnaireResponses}
        selectedQuestionnaireResponseIndex={selectedQuestionnaireResponseIndex}
        questionnaireResponseIsSearching={questionnaireResponseIsSearching}
        onQrSelectedIndexChange={onQrSelectedIndexChange}
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
            if (typeof selectedQuestionnaireResponseIndex === 'number' && selectedQuestionnaire) {
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
  );
}

export default PickerQuestionnaireResponseCard;
