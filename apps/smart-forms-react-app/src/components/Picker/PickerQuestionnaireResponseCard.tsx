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

import { Questionnaire, QuestionnaireResponse } from 'fhir/r5';
import React, { useContext, useState } from 'react';
import { Box } from '@mui/material';
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
import { SideBarOverlineTypography } from '../StyledComponents/Typographys.styles';

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
  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = useContext(QuestionnaireResponseProviderContext);
  const { goToPage } = useContext(PageSwitcherContext);
  const { fhirClient } = useContext(LaunchContext);

  const [viewResponseButtonLoading, setViewResponseButtonLoading] = useState(false);

  async function handleViewResponseButtonClick() {
    if (typeof selectedQuestionnaireResponseIndex === 'number') {
      setViewResponseButtonLoading(true);
      const questionnaireResponse = questionnaireResponses[selectedQuestionnaireResponseIndex];

      // Assign questionnaireResponse to questionnaireResponse provider
      questionnaireResponseProvider.setQuestionnaireResponse(questionnaireResponse);

      // Assign questionnaire to questionnaire provider
      if (selectedQuestionnaire) {
        await questionnaireProvider.setQuestionnaire(
          selectedQuestionnaire,
          questionnaireSourceIsLocal,
          fhirClient
        );
      } else {
        const questionnaireReference = questionnaireResponse.questionnaire;
        if (!questionnaireReference || !fhirClient) return null;

        const questionnaire = await loadQuestionnaireFromResponse(
          fhirClient,
          questionnaireReference
        );
        await questionnaireProvider.setQuestionnaire(
          questionnaire,
          questionnaireSourceIsLocal,
          fhirClient
        );
      }

      setViewResponseButtonLoading(false);
      goToPage(PageType.ResponsePreview);
    }
  }

  return (
    <FullHeightCard>
      <Box display="flex" flexDirection="row">
        <SideBarOverlineTypography variant="overline" data-test="picker-card-heading-responses">
          Responses
        </SideBarOverlineTypography>
        {questionnaireResponses.length > 0 && !questionnaireResponseIsSearching ? (
          <>
            <Box sx={{ flexGrow: 1 }}></Box>
            <Box sx={{ ml: 2, mt: 1 }}>
              <PickerQuestionnaireResponseListFilterPopper
                onQrSortByParamChange={onQrSortByParamChange}
              />
            </Box>
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
