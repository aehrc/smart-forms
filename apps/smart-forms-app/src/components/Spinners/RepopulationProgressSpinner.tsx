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

import { memo } from 'react';
import { Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { SyncLoader } from 'react-spinners';
import CenteredWrapper from '../Wrapper/CenteredWrapper.tsx';

interface RepopulationProgressSpinnerProps {
  message: string;
}

const RepopulationProgressSpinner = memo(function RepopulationProgressSpinner(
  props: RepopulationProgressSpinnerProps
) {
  const { message } = props;

  const theme = useTheme();

  return (
    <CenteredWrapper>
      <Stack alignItems="center" rowGap={3.5}>
        <SyncLoader color={theme.palette.primary.main} />
        <Typography variant="subtitle1">{message}</Typography>
      </Stack>
    </CenteredWrapper>
  );
});

export default RepopulationProgressSpinner;
