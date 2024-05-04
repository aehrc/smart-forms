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

import { Stack, Typography } from '@mui/material';
import ProgressSpinner from '../../../components/Spinners/ProgressSpinner.tsx';
import type { AuthState } from '../types/authorisation.interface.ts';
import CenteredWrapper from '../../../components/Wrapper/CenteredWrapper.tsx';
import UnlaunchedButton from '../../../components/Button/UnlaunchedButton.tsx';
import useSmartClient from '../../../hooks/useSmartClient.ts';
import AuthDebugLaunchContexts from './AuthDebugLaunchContexts.tsx';
import AuthDebugFhirClient from './AuthDebugFhirClient.tsx';
import AuthDebugErrorMessage from './AuthDebugErrorMessage.tsx';

interface RenderAuthStatusProps {
  authState: AuthState;
}

function RenderAuthStatus(props: RenderAuthStatusProps) {
  const { authState } = props;

  const { smartClient, patient, user, encounter, launchQuestionnaire } = useSmartClient();

  const launchFailed =
    authState.hasClient === false || authState.hasUser === false || authState.hasPatient === false;

  const launchContexts = [
    { contextName: 'Patient (required)', contextResource: patient },
    { contextName: 'User (required)', contextResource: user },
    { contextName: 'Encounter (optional)', contextResource: encounter },
    { contextName: 'Questionnaire (optional)', contextResource: launchQuestionnaire }
  ];

  if (launchFailed) {
    return (
      <CenteredWrapper>
        <Stack mt={2} rowGap={2}>
          <Typography variant="h3">An error occurred while authorising the launch.</Typography>
          <Typography fontSize={13}>
            {'Try relaunching the app or contact your administrator for assistance.'}
          </Typography>
        </Stack>
        <UnlaunchedButton />
        <Stack my={4} rowGap={1}>
          <Typography variant="subtitle2">Debug panel:</Typography>
          <AuthDebugLaunchContexts launchContexts={launchContexts} />
          <AuthDebugFhirClient smartClient={smartClient} />

          {authState.errorMessage ? (
            <AuthDebugErrorMessage errorMessage={authState.errorMessage} />
          ) : null}
        </Stack>
      </CenteredWrapper>
    );
  }

  return <ProgressSpinner message={'Getting ready'} />;
}

export default RenderAuthStatus;
