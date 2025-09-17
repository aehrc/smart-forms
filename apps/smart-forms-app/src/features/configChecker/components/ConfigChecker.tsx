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

import { Alert, AlertTitle, Box, Container, Typography } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import type { ConfigFile } from '../utils/config.ts';
import ConfigCheckerList from './ConfigCheckerList.tsx';
import CenteredWrapper from '../../../components/Wrapper/CenteredWrapper.tsx';

interface ConfigListProps {
  config: Partial<ConfigFile>;
}

function ConfigChecker(props: ConfigListProps) {
  const { config } = props;

  return (
    <CenteredWrapper>
      <Container>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, py: 2 }}>
          {/* Main content */}
          <Box sx={{ display: 'grid', gap: 2, maxWidth: '6xl', mx: 'auto', width: '100%' }}>
            <Alert severity="warning" icon={<WarningIcon />}>
              <AlertTitle variant="subtitle1">Configuration File Invalid</AlertTitle>
              Review your config.json. Missing or invalid items are marked with an X.
            </Alert>

            <ConfigCheckerList config={config} />

            <Typography>
              Refer to{' '}
              <a
                href="https://github.com/aehrc/smart-forms/blob/alpha/LOCAL_DEVELOPMENT.md"
                target="_blank"
                rel="noreferrer">
                LOCAL_DEVELOPMENT.md
              </a>{' '}
              to set up your config.json file properly.
            </Typography>
          </Box>
        </Box>
      </Container>
    </CenteredWrapper>
  );
}

export default ConfigChecker;
