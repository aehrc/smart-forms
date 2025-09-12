/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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

import { Box, LinearProgress, Typography } from '@mui/material';

interface ConfigCheckerProgressProps {
  validCount: number;
  totalCount: number;
}

function ConfigCheckerProgress(props: ConfigCheckerProgressProps) {
  const { validCount, totalCount } = props;

  const percentage = Math.round((validCount / totalCount) * 100);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Typography color="text.secondary">
        Configuration Status: {validCount}/{totalCount} configured
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            width: 96,
            height: 8,
            borderRadius: 4,
            backgroundColor: 'action.hover',
            '& .MuiLinearProgress-bar': {
              backgroundColor: validCount === totalCount ? 'success.main' : 'warning.main',
              borderRadius: 4
            }
          }}
        />
        <Typography color="text.secondary">{percentage}%</Typography>
      </Box>
    </Box>
  );
}

export default ConfigCheckerProgress;
