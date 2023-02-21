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

import { SideBarOverlineTypography } from '../StyledComponents/Typographys.styles';
import PickerQuestionnaireCardContent from './PickerQuestionnaireCardContent';
import { Box } from '@mui/material';
import { RoundButton } from '../StyledComponents/Buttons.styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { PageType } from '../../interfaces/Enums';
import { FullHeightCard } from '../StyledComponents/Card.styles';
import React, { useContext, useState } from 'react';
import { Questionnaire } from 'fhir/r5';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../App';
import { PageSwitcherContext } from '../../custom-contexts/PageSwitcherContext';
import { createQuestionnaireResponse } from '../../functions/QrItemFunctions';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import { WhiteCircularProgress } from '../StyledComponents/Progress.styles';

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
  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = useContext(QuestionnaireResponseProviderContext);
  const { goToPage } = useContext(PageSwitcherContext);
  const { fhirClient } = useContext(LaunchContext);

  const [createNewResponseButtonLoading, setCreateNewResponseButtonLoading] = useState(false);

  async function handleCreateNewResponseButtonClick() {
    if (typeof selectedQuestionnaireIndex === 'number' && selectedQuestionnaire) {
      setCreateNewResponseButtonLoading(true);

      // Assign questionnaire to questionnaire provider
      await questionnaireProvider.setQuestionnaire(
        selectedQuestionnaire,
        questionnaireSourceIsLocal,
        fhirClient
      );

      // Assign questionnaireResponse to questionnaireResponse provider
      if (selectedQuestionnaire.item && selectedQuestionnaire.item.length > 0) {
        questionnaireResponseProvider.setQuestionnaireResponse(
          createQuestionnaireResponse(selectedQuestionnaire.id, selectedQuestionnaire.item[0])
        );
      }

      setCreateNewResponseButtonLoading(false);
      goToPage(PageType.Renderer);
    }
  }

  return (
    <FullHeightCard>
      <SideBarOverlineTypography variant="overline" data-test="picker-card-heading-questionnaires">
        Questionnaires
      </SideBarOverlineTypography>
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
          endIcon={
            createNewResponseButtonLoading ? (
              <WhiteCircularProgress size={20} />
            ) : (
              <ArrowForwardIcon />
            )
          }
          disabled={typeof selectedQuestionnaireIndex !== 'number'}
          onClick={handleCreateNewResponseButtonClick}
          sx={{ m: 1.5, textTransform: 'Capitalize' }}
          data-test="button-create-response">
          Create new response
        </RoundButton>
      </Box>
    </FullHeightCard>
  );
}
export default PickerQuestionnaireCard;
