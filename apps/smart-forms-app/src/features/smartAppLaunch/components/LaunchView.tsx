/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License with the License.
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
import { Stack, Typography, Alert, Box } from '@mui/material';
import CenteredWrapper from '../../../components/Wrapper/CenteredWrapper.tsx';
import UnlaunchedButton from '../../../components/Button/UnlaunchedButton.tsx';

interface LaunchViewProps {
  launchState: LaunchState;
  error?: string | null;
  isRegistering?: boolean;
  useFixedClientId?: boolean;
  dynamicClientId?: string | null;
  fixedClientId?: string | null;
}

function LaunchView(props: LaunchViewProps) {
  const { 
    launchState, 
    error, 
    isRegistering, 
    useFixedClientId, 
    dynamicClientId, 
    fixedClientId 
  } = props;

  if (launchState === 'error') {
    return (
      <CenteredWrapper>
        <Stack rowGap={2}>
          <Typography variant="h3">An error occurred while launching the app.</Typography>
          
          {error && (
            <Alert severity="error" sx={{ maxWidth: '600px' }}>
              <Typography variant="body2" fontWeight="bold">Error Details:</Typography>
              <Typography variant="body2">{error}</Typography>
            </Alert>
          )}
          
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

  if (isRegistering) {
    return (
      <CenteredWrapper>
        <Stack rowGap={2} alignItems="center">
          <ProgressSpinner message="Registering client with authorization server..." />
          <Typography variant="body2" color="text.secondary">
            This may take a few moments...
          </Typography>
        </Stack>
      </CenteredWrapper>
    );
  }

  if (launchState === 'success') {
    return (
      <CenteredWrapper>
        <Stack rowGap={2} alignItems="center">
          <ProgressSpinner message="Launching Smart Forms" />
          
          {/* Display client ID information for debugging */}
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Client Registration Status:
            </Typography>
            {useFixedClientId && fixedClientId && (
              <Typography variant="body2">
                Using fixed client ID: <strong>{fixedClientId}</strong>
              </Typography>
            )}
            {dynamicClientId && (
              <Typography variant="body2">
                Dynamically registered client ID: <strong>{dynamicClientId}</strong>
              </Typography>
            )}
            {!useFixedClientId && !dynamicClientId && (
              <Typography variant="body2">
                Using fallback client ID: <strong>LAUNCH_CLIENT_ID</strong>
              </Typography>
            )}
          </Box>
        </Stack>
      </CenteredWrapper>
    );
  }

  // Default loading state
  return (
    <CenteredWrapper>
      <ProgressSpinner message="Launching Smart Forms" />
    </CenteredWrapper>
  );
}

export default LaunchView;
