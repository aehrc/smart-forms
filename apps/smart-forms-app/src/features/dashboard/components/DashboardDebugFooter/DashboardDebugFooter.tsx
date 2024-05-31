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

import { StyledRoot } from '../../../../components/DebugFooter/DebugFooter.styles.ts';
import { Box, Typography } from '@mui/material';
import useSmartClient from '../../../../hooks/useSmartClient.ts';
import { FORMS_SERVER_URL, LAUNCH_CLIENT_ID } from '../../../../globals.ts';

function DashboardDebugFooter() {
  const { smartClient } = useSmartClient();

  return (
    <>
      <StyledRoot>
        <Box display="flex" flexDirection="row-reverse" gap={2.5} sx={{ mx: 1.5 }}>
          <Typography variant="overline">
            {`Response server: ${smartClient?.state.serverUrl}`}
          </Typography>
          <Typography variant="overline">
            {`Forms server: ${
              FORMS_SERVER_URL ?? 'Undefined. Defaulting to https://smartforms.csiro.au/api/fhir'
            }`}
          </Typography>
          <Typography variant="overline">{`Client ID: ${LAUNCH_CLIENT_ID}`}</Typography>
        </Box>
      </StyledRoot>
    </>
  );
}

export default DashboardDebugFooter;
