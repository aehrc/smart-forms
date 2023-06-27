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

import Iconify from '../../../components/Iconify/Iconify.tsx';

import { useTheme } from '@mui/material/styles';
import DesktopHeader from '../../../components/Header/DesktopHeader.tsx';
import useResponsive from '../../../hooks/useResponsive.ts';
import Logo from '../../../components/Logos/Logo.tsx';
import { Box, Stack } from '@mui/material';
import {
  MenuIconButton,
  StyledRoot,
  StyledToolbar
} from '../../../components/Header/Header.styles.ts';
import { LogoWrapper } from '../../../components/Logos/Logo.styles.ts';
import MobileHeaderWithQuestionnaire from '../../../components/Header/MobileHeaderWithQuestionnaire.tsx';

interface Props {
  onOpenNav: () => void;
}

function ViewerHeader(props: Props) {
  const { onOpenNav } = props;

  const theme = useTheme();

  const isDesktop = useResponsive('up', 'lg');

  return (
    <StyledRoot>
      <StyledToolbar>
        <MenuIconButton onClick={onOpenNav}>
          <Iconify icon="eva:menu-2-fill" />
        </MenuIconButton>

        {!isDesktop ? (
          <LogoWrapper>
            <Logo />
          </LogoWrapper>
        ) : null}

        <Box flexGrow={1} />

        <Stack
          direction="row"
          alignItems="center"
          spacing={{
            xs: 0.5,
            sm: 1
          }}
          sx={{ color: theme.palette.grey['700'] }}>
          {isDesktop ? <DesktopHeader /> : <MobileHeaderWithQuestionnaire />}
        </Stack>
      </StyledToolbar>
    </StyledRoot>
  );
}

export default ViewerHeader;
