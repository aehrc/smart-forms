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

import { Box, Stack, Typography } from '@mui/material';
import ReauthenticateButton from '../../components/Button/ReauthenticateButton.tsx';
import NotFoundQuickLinks from './NotFoundQuickLinks.tsx';

interface NotFoundSelectionsProps {
  authSessionFound: boolean;
}

function NotFoundSelections(props: NotFoundSelectionsProps) {
  const { authSessionFound } = props;

  if (authSessionFound) {
    return (
      <>
        <Stack rowGap={1.5}>
          <Typography fontSize={15}>
            {
              "We couldn't find the page you were looking for, but we detected a recent authorisation session."
            }
          </Typography>
          <Typography fontSize={15}>
            You would need to be re-authenticated. Do you want to try re-authenticating?
          </Typography>
        </Stack>
        <Box mt={4} />
        <ReauthenticateButton />
      </>
    );
  }

  return (
    <>
      <Stack rowGap={1.5} mb={5}>
        <Typography fontSize={14}>{"We couldn't find what you were looking for."}</Typography>

        <Typography fontSize={14}>
          Use the quick links below to navigate to the page you were looking for.
        </Typography>
      </Stack>

      <NotFoundQuickLinks />
    </>
  );
}

export default NotFoundSelections;
