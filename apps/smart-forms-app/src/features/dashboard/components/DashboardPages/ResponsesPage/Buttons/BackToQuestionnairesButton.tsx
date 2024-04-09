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

import { IconButton, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import useSelectedQuestionnaire from '../../../../hooks/useSelectedQuestionnaire.ts';

function BackToQuestionnairesButton() {
  const { existingResponses } = useSelectedQuestionnaire();
  const navigate = useNavigate();

  return existingResponses.length > 0 ? (
    <Tooltip title="Go back">
      <IconButton
        color="secondary"
        size="small"
        onClick={() => {
          navigate('/dashboard/questionnaires');
        }}
        sx={{ ml: -1, mr: 0.75 }}>
        <ArrowBackIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  ) : null;
}

export default BackToQuestionnairesButton;
