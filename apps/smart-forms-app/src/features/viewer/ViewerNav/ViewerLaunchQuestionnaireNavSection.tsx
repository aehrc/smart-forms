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

import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Box, List, Typography } from '@mui/material';
import RendererOperationItem from '../../renderer/components/RendererNav/RendererOperationItem.tsx';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import useSmartClient from '../../../hooks/useSmartClient.ts';
import useSelectedQuestionnaire from '../../dashboard/hooks/useSelectedQuestionnaire.ts';

function ViewerLaunchQuestionnaireNavSection() {
  const navigate = useNavigate();
  const { closeSnackbar } = useSnackbar();
  const { launchQuestionnaire } = useSmartClient();

  const { setSelectedQuestionnaire } = useSelectedQuestionnaire();

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ px: 2.5, pb: 0.75 }}>
        <Typography variant="overline">Responses</Typography>
      </Box>
      <List disablePadding sx={{ px: 1 }}>
        <RendererOperationItem
          title="Back to Responses"
          icon={<ArrowBackIcon />}
          onClick={() => {
            closeSnackbar();
            setSelectedQuestionnaire(launchQuestionnaire);
            navigate('/dashboard/existing');
          }}
        />
      </List>
    </Box>
  );
}

export default ViewerLaunchQuestionnaireNavSection;
