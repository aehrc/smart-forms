/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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

import CenteredWrapper from '../../../components/Wrapper/CenteredWrapper.tsx';
import { Box, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { ConfigErrorType } from '../contexts/ConfigContext.tsx';

interface ConfigErrorProps {
  configErrorType: ConfigErrorType;
}

function ConfigError(props: ConfigErrorProps) {
  const { configErrorType } = props;

  return (
    <CenteredWrapper>
      <Stack alignItems="center" rowGap={3}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'rgb(254 226 226)'
          }}>
          <CloseIcon sx={{ fontSize: 40, color: 'error.main' }} />
        </Box>

        {/* Text block */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography fontWeight="500" fontSize="1rem" sx={{ mb: 1 }}>
            Configuration Error
          </Typography>
          <Typography color="text.secondary">
            {configErrorType === 'registeredClientIds'
              ? 'Configuration file loaded, but unable to load registered client IDs from the specified endpoint.'
              : 'Unable to load configuration file, it is likely that a configuration file at /config.json (in public folder) does not exist.'}
          </Typography>
          <Typography color="text.secondary">View the console for details.</Typography>
        </Box>
      </Stack>
    </CenteredWrapper>
  );
}

export default ConfigError;
