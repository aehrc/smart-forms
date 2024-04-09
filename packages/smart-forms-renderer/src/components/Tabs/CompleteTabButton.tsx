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

import React, { memo } from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useQuestionnaireStore } from '../../stores';

interface CompleteTabButtonProps {
  tabLinkId: string;
  tabIsMarkedAsComplete: boolean;
}

const CompleteTabButton = memo(function CompleteTabButton(props: CompleteTabButtonProps) {
  const { tabLinkId, tabIsMarkedAsComplete } = props;

  const markTabAsComplete = useQuestionnaireStore.use.markTabAsComplete();

  return (
    <Tooltip title={tabIsMarkedAsComplete ? 'Mark as incomplete' : 'Complete tab'}>
      <IconButton onClick={() => markTabAsComplete(tabLinkId)}>
        <CheckCircleIcon color={tabIsMarkedAsComplete ? 'success' : 'inherit'} />
      </IconButton>
    </Tooltip>
  );
});

export default CompleteTabButton;
