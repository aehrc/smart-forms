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
import CreateNewResponseButton from '../Buttons/CreateNewResponseButton.tsx';
import ViewExistingResponsesButton from '../Buttons/ViewExistingResponsesButton.tsx';
import ClearIcon from '@mui/icons-material/Clear';
import useSmartClient from '../../../../../../hooks/useSmartClient.ts';

interface QuestionnaireListToolbarButtonsProps {
  onClearSelection: () => void;
}

function QuestionnaireListToolbarButtons(props: QuestionnaireListToolbarButtonsProps) {
  const { onClearSelection } = props;

  const { smartClient } = useSmartClient();

  return (
    <Box display="flex" alignItems="center" columnGap={2}>
      <CreateNewResponseButton />

      {smartClient ? <ViewExistingResponsesButton /> : null}

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

export default QuestionnaireListToolbarButtons;
