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

import { StyledRoot } from '../../StyledComponents/DebugFooter.styles';
import { useContext } from 'react';
import { Box, Typography } from '@mui/material';
import { SmartAppLaunchContext } from '../../../custom-contexts/SmartAppLaunchContext.tsx';

function DashboardDebugFooter() {
  const { fhirClient } = useContext(SmartAppLaunchContext);

  return (
    <>
      <StyledRoot>
        <Box display="flex" flexDirection="row-reverse" gap={2.5} sx={{ mx: 1.5 }}>
          <Typography variant="overline">
            {`Response server: ${fhirClient?.state.serverUrl}`}
          </Typography>
          <Typography variant="overline">
            {`Forms server: ${
              import.meta.env.VITE_FORMS_SERVER_URL ??
              'Undefined. Defaulting to https://api.smartforms.io/fhir'
            }`}
          </Typography>
        </Box>
      </StyledRoot>
    </>
  );
}

export default DashboardDebugFooter;
