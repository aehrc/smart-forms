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

import { memo } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { GridLoader } from 'react-spinners';

interface Props {
  message: string;
}

function PopulationProgressSpinner(props: Props) {
  const { message } = props;

  const theme = useTheme();

  return (
    <Stack justifyContent="center" spacing={3} data-test="progress-spinner" sx={{ height: '100%' }}>
      <Box display="flex" flexDirection="row" justifyContent="center">
        <GridLoader color={theme.palette.primary.main} />
      </Box>
      <Box textAlign="center" sx={{ mt: 2 }}>
        <Typography variant="subtitle1">{message}</Typography>
      </Box>
    </Stack>
  );
}

export default memo(PopulationProgressSpinner);
