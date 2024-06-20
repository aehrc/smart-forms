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

import { Box, List } from '@mui/material';
import { NavSectionHeading } from '../../../../components/Nav/Nav.styles.ts';
import useSmartClient from '../../../../hooks/useSmartClient.ts';
import ViewExistingResponsesAction from '../RendererActions/ViewExistingResponsesAction.tsx';
import PreviewAction from '../RendererActions/PreviewAction.tsx';
import SaveProgressAction from '../RendererActions/SaveProgressAction.tsx';
import SaveAsFinalAction from '../RendererActions/SaveAsFinalAction.tsx';
import RepopulateAction from '../RendererActions/RepopulateAction.tsx';
import { useQuestionnaireStore } from '@aehrc/smart-forms-renderer';
import type { RendererSpinner } from '../../types/rendererSpinner.ts';
import useFetchExistingResponses from '../../../dashboard/hooks/useFetchExistingResponses.ts';

interface RendererNavLaunchQuestionnaireActionsProps {
  spinner: RendererSpinner;
  onSpinnerChange: (newSpinner: RendererSpinner) => void;
}

function RendererNavLaunchQuestionnaireActions(props: RendererNavLaunchQuestionnaireActionsProps) {
  const { spinner, onSpinnerChange } = props;

  const { smartClient } = useSmartClient();

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();

  const { existingResponses, fetchError, refetchResponses } = useFetchExistingResponses();

  return (
    <Box>
      <Box sx={{ pb: 4 }}>
        <Box sx={{ px: 2.5, pb: 0.75 }}>
          <NavSectionHeading>Responses</NavSectionHeading>
        </Box>
        <List disablePadding sx={{ px: 1 }}>
          <ViewExistingResponsesAction
            existingResponses={existingResponses}
            fetchResponsesError={fetchError}
          />
        </List>
      </Box>

      <Box sx={{ pb: 4 }}>
        <Box sx={{ px: 2.5, pb: 0.75 }}>
          <NavSectionHeading>Operations</NavSectionHeading>
        </Box>
        <List disablePadding sx={{ px: 1 }}>
          <PreviewAction />
          {smartClient && sourceQuestionnaire.item ? (
            <>
              <SaveProgressAction refetchResponses={refetchResponses} />
              <SaveAsFinalAction />
              <RepopulateAction spinner={spinner} onSpinnerChange={onSpinnerChange} />
            </>
          ) : null}
        </List>
      </Box>
    </Box>
  );
}

export default RendererNavLaunchQuestionnaireActions;
