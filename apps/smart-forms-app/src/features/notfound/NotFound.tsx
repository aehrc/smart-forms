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

import CenteredWrapper from '../../components/Wrapper/CenteredWrapper.tsx';
import { Stack, Typography } from '@mui/material';
import UnlaunchedButton from '../../components/Button/UnlaunchedButton.tsx';
import useConfigStore from '../../stores/useConfigStore.ts';
import ReauthenticateButton from '../../components/Button/ReauthenticateButton.tsx';

function NotFound() {
  const smartClient = useConfigStore((state) => state.smartClient);

  const isNotLaunched = !smartClient;

  const authSessionFound = isNotLaunched && sessionStorage.getItem('authorised') === 'true';

  return (
    <CenteredWrapper>
      <Stack rowGap={2}>
        <Typography variant="h3">Error 404</Typography>
        <Typography fontSize={13}>
          {authSessionFound
            ? "We couldn't find the page you were looking for, but we detected a recent auth session. You would need to be re-authenticated. Do you want to try re-authenticating?"
            : "We couldn't find the page you were looking for. Do you want to go back to the home page?"}
        </Typography>
      </Stack>
      {authSessionFound ? <ReauthenticateButton /> : <UnlaunchedButton />}
    </CenteredWrapper>
  );
}

export default NotFound;
