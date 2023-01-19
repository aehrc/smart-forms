import { Questionnaire, QuestionnaireResponse } from 'fhir/r5';
import React, { useContext, useState } from 'react';
import { Box, Typography } from '@mui/material';
import PickerQuestionnaireResponseCardContent from './PickerQuestionnaireResponseCardContent';
import { RoundButton } from '../StyledComponents/Buttons.styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { PageType } from '../../interfaces/Enums';
import { FullHeightCard } from '../StyledComponents/Card.styles';
import { PageSwitcherContext } from '../../custom-contexts/PageSwitcherContext';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../App';
import { loadQuestionnaireFromResponse } from '../../functions/LoadServerResourceFunctions';
import { WhiteCircularProgress } from '../StyledComponents/Progress.styles';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import PickerQuestionnaireResponseListFilterPopper from './PickerQuestionnaireResponseListFilterPopper';

interface Props {
  questionnaireResponses: QuestionnaireResponse[];
  selectedQuestionnaire: Questionnaire | null;
  selectedQuestionnaireIndex: number | null;
  selectedQuestionnaireResponseIndex: number | null;
  questionnaireResponseIsSearching: boolean;
  questionnaireSourceIsLocal: boolean;
  onQrSelectedIndexChange: (index: number) => unknown;
  onQrSortByParamChange: (sortByParam: string) => unknown;
}

function PickerQuestionnaireResponseCard(props: Props) {
  const {
    questionnaireResponses,
    selectedQuestionnaire,
    selectedQuestionnaireIndex,
    selectedQuestionnaireResponseIndex,
    questionnaireResponseIsSearching,
    questionnaireSourceIsLocal,
    onQrSelectedIndexChange,
    onQrSortByParamChange
  } = props;
  const questionnaireProvider = React.useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = React.useContext(QuestionnaireResponseProviderContext);
  const pageSwitcher = useContext(PageSwitcherContext);
  const launch = useContext(LaunchContext);

  const [viewResponseButtonLoading, setViewResponseButtonLoading] = useState(false);

  function handleViewResponseButtonClick() {
    if (typeof selectedQuestionnaireResponseIndex === 'number') {
      questionnaireResponseProvider.setQuestionnaireResponse(
        questionnaireResponses[selectedQuestionnaireResponseIndex]
      );

      if (selectedQuestionnaire) {
        questionnaireProvider.setQuestionnaire(
          selectedQuestionnaire,
          questionnaireSourceIsLocal,
          launch.fhirClient
        );
        pageSwitcher.goToPage(PageType.ResponsePreview);
      } else {
        const questionnaireReference =
          questionnaireResponses[selectedQuestionnaireResponseIndex].questionnaire;
        if (!questionnaireReference) return null;

        if (launch.fhirClient) {
          setViewResponseButtonLoading(true);
          loadQuestionnaireFromResponse(launch.fhirClient, questionnaireReference)
            .then((questionnaire) => {
              questionnaireProvider.setQuestionnaire(
                questionnaire,
                questionnaireSourceIsLocal,
                launch.fhirClient
              );
              setViewResponseButtonLoading(false);
              pageSwitcher.goToPage(PageType.ResponsePreview);
            })
            .catch(() => setViewResponseButtonLoading(false));
        }
      }
    }
  }

  return (
    <FullHeightCard>
      <Box display="flex" flexDirection="row" sx={{ ml: 2, mr: 1.5, mt: 1 }}>
        <Typography variant="overline" fontSize={10}>
          Responses
        </Typography>
        {questionnaireResponses.length > 0 && !questionnaireResponseIsSearching ? (
          <>
            <Box sx={{ flexGrow: 1 }}></Box>
            <PickerQuestionnaireResponseListFilterPopper
              onQrSortByParamChange={onQrSortByParamChange}
            />
          </>
        ) : null}
      </Box>
      <PickerQuestionnaireResponseCardContent
        questionnaireResponses={questionnaireResponses}
        selectedQuestionnaireIndex={selectedQuestionnaireIndex}
        selectedQuestionnaireResponseIndex={selectedQuestionnaireResponseIndex}
        questionnaireResponseIsSearching={questionnaireResponseIsSearching}
        questionnaireSourceIsLocal={questionnaireSourceIsLocal}
        onQrSelectedIndexChange={onQrSelectedIndexChange}
      />

      <Box sx={{ flexGrow: 1 }}></Box>
      <Box display="flex" flexDirection="row-reverse">
        <RoundButton
          variant="contained"
          endIcon={
            viewResponseButtonLoading ? <WhiteCircularProgress size={20} /> : <ArrowForwardIcon />
          }
          disabled={typeof selectedQuestionnaireResponseIndex !== 'number'}
          onClick={() => handleViewResponseButtonClick()}
          sx={{ m: 1.5, textTransform: 'Capitalize' }}>
          View response
        </RoundButton>
      </Box>
    </FullHeightCard>
  );
}

export default PickerQuestionnaireResponseCard;
