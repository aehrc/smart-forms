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

import { Box, IconButton, Stack, Typography } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import Iconify from '../../../../../../components/Iconify/Iconify.tsx';
import { constructName } from '../../../../../smartAppLaunch/utils/launchContext.ts';
import OpenResponseButton from '../Buttons/OpenResponseButton.tsx';
import useResponsive from '../../../../../../hooks/useResponsive.ts';
import type { QuestionnaireResponse } from 'fhir/r4';
import useSmartClient from '../../../../../../hooks/useSmartClient.ts';
import useSelectedQuestionnaire from '../../../../hooks/useSelectedQuestionnaire.ts';

interface ResponseListToolbarButtonsProps {
  selectedResponse: QuestionnaireResponse | null;
  onClearSelection: () => void;
}

function ResponseListToolbarButtons(props: ResponseListToolbarButtonsProps) {
  const { selectedResponse, onClearSelection } = props;

  const { selectedQuestionnaire, existingResponses, clearSelectedQuestionnaire } =
    useSelectedQuestionnaire();

  const { patient } = useSmartClient();

  const isDesktop = useResponsive('up', 'lg');

  if (selectedResponse) {
    return (
      <Box display="flex" alignItems="center" columnGap={2}>
        <OpenResponseButton selectedResponse={selectedResponse} />
        <Stack alignItems="center">
          <IconButton onClick={onClearSelection}>
            <ClearIcon />
          </IconButton>
          <Typography
            fontSize={9}
            variant="subtitle2"
            color={'text.secondary'}
            sx={{ mt: -0.5, mb: 0.5 }}>
            Unselect
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (selectedQuestionnaire && existingResponses.length > 0) {
    return (
      <Stack alignItems="center">
        <IconButton
          onClick={() => clearSelectedQuestionnaire()}
          data-test="button-remove-questionnaire-filter">
          <Iconify icon="material-symbols:filter-alt-off-outline" />
        </IconButton>
        <Typography
          fontSize={9}
          variant="subtitle2"
          color={'text.secondary'}
          sx={{ mt: -0.5, mb: 0.5 }}>
          Remove filter
        </Typography>
      </Stack>
    );
  }

  return (
    <Typography variant="subtitle1" fontSize={isDesktop ? 12 : 11}>
      Showing responses for <b>{constructName(patient?.name)}</b>
    </Typography>
  );
}

export default ResponseListToolbarButtons;
