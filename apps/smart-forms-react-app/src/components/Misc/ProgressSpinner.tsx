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

import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { Stack, Typography } from '@mui/material';

interface Props {
  message: string;
}

function ProgressSpinner(props: Props) {
  const { message } = props;

  return (
    <Stack
      direction="column"
      justifyContent="center"
      spacing={3}
      data-test="progress-spinner"
      sx={{ height: '100%' }}>
      <Box display="flex" flexDirection="row" justifyContent="center">
        <CircularProgress size={72} />
      </Box>
      <Box textAlign="center" sx={{ mt: 2 }}>
        <Typography variant="subtitle1">{message}</Typography>
      </Box>
    </Stack>
  );
}

export default ProgressSpinner;
