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

import ProgressSpinner from '../../../components/Spinners/ProgressSpinner.tsx';
import type { LaunchState } from './Launch.tsx';
import { Stack, Typography } from '@mui/material';
import CenteredWrapper from '../../../components/Wrapper/CenteredWrapper.tsx';
import UnlaunchedButton from '../../../components/Button/UnlaunchedButton.tsx';

interface LaunchViewProps {
  launchState: LaunchState;
}

function LaunchView(props: LaunchViewProps) {
  const { launchState } = props;

  if (launchState === 'error') {
    return (
      <CenteredWrapper>
        <Stack rowGap={2}>
          <Typography variant="h3">An error occurred while launching the app.</Typography>
          <Typography fontSize={13}>
            {"You might have incorrect launch parameters in the URL or the server doesn't exist. "}
            <br />
            {'Please contact your administrator for assistance.'}
          </Typography>
        </Stack>

        <UnlaunchedButton />
      </CenteredWrapper>
    );
  }

  return <ProgressSpinner message="Launching Smart Forms" />;
}

export default LaunchView;
