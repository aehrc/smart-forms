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

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { IconButton } from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

interface ShowCompletedTabsSectionProps {
  completedTabsExpanded: boolean;
  setCompletedTabsExpanded: (newExpanded: boolean) => void;
}

function ShowCompletedTabsSection(props: ShowCompletedTabsSectionProps) {
  const { completedTabsExpanded, setCompletedTabsExpanded } = props;

  return (
    <Box display="flex" justifyContent="center" alignItems="center" mx={2} columnGap={0.5}>
      <Typography
        variant="overline"
        fontSize={8.5}
        color={completedTabsExpanded ? 'text.secondary' : 'text.disabled'}>
        Completed tabs {completedTabsExpanded ? 'shown' : 'hidden'}
      </Typography>
      <IconButton
        size="small"
        onClick={() => {
          setCompletedTabsExpanded(!completedTabsExpanded);
        }}>
        {completedTabsExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
      </IconButton>
    </Box>
  );
}

export default ShowCompletedTabsSection;
