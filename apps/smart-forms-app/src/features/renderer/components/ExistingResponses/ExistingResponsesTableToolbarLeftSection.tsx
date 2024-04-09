/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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

import type { QuestionnaireResponse } from 'fhir/r4';
import { createResponseListItem } from '../../../dashboard/utils/dashboard.ts';
import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import BackToQuestionnairesButton from '../../../dashboard/components/DashboardPages/ResponsesPage/Buttons/BackToQuestionnairesButton.tsx';
import useSmartClient from '../../../../hooks/useSmartClient.ts';

interface ExistingResponsesTableToolbarLeftSectionProps {
  selectedResponse: QuestionnaireResponse | null;
}

function ExistingResponsesTableToolbarLeftSection(
  props: ExistingResponsesTableToolbarLeftSectionProps
) {
  const { selectedResponse } = props;
  const { launchQuestionnaire } = useSmartClient();

  if (selectedResponse) {
    const listItem = createResponseListItem(selectedResponse, -1);
    return (
      <Typography component="div" variant="subtitle1">
        {listItem.title} — {dayjs(listItem.authored).format('LL')} selected
      </Typography>
    );
  }

  const selectedQuestionnaireTitle = launchQuestionnaire?.title ?? 'selected questionnaire';
  return (
    <Box display="flex" alignItems="center">
      <BackToQuestionnairesButton />
      <Typography variant="subtitle1">
        Displaying responses of the <b>{selectedQuestionnaireTitle}</b> questionnaire
      </Typography>
    </Box>
  );
}

export default ExistingResponsesTableToolbarLeftSection;
