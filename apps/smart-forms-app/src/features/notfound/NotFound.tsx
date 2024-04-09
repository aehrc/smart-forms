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

import { Box, Container, Stack, Typography } from '@mui/material';
import useSmartClient from '../../hooks/useSmartClient.ts';
import Logo from '../../components/Logos/Logo.tsx';
import csiroLogo from '../../data/images/csiro-logo.png';
import NotFoundSelections from './NotFoundSelections.tsx';
import useResponsive from '../../hooks/useResponsive.ts';

function NotFound() {
  const { smartClient } = useSmartClient();

  const isDesktop = useResponsive('up', 'lg');

  const isNotLaunched = !smartClient;

  const authSessionFound = isNotLaunched && sessionStorage.getItem('authorised') === 'true';

  return (
    <>
      <Box display="flex" px={2.5} pt={2}>
        <Logo />
        <Box flexGrow={1} />
        <Box display="flex" alignItems="center" columnGap={1}>
          <Typography sx={{ color: 'text.secondary' }}>By</Typography>
          <Box component="img" maxHeight={35} maxWidth={35} src={csiroLogo} />
        </Box>
      </Box>

      <Box mb={isDesktop ? 10 : 5} />

      <Stack justifyContent="center" alignItems="center">
        <Container>
          <Typography variant="h2" mb={2.5}>
            Error 404
          </Typography>
          <NotFoundSelections authSessionFound={authSessionFound} />
        </Container>
      </Stack>
    </>
  );
}

export default NotFound;
