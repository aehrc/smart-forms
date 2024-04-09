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

import { Box } from '@mui/material';
import Iconify from '../Iconify/Iconify.tsx';
import useResponsive from '../../hooks/useResponsive.ts';
import Logo from '../Logos/Logo.tsx';
import { LogoWrapper } from '../Logos/Logo.styles.ts';
import { MenuIconButton, StyledRoot, StyledToolbar } from './Header.styles.ts';
import { memo } from 'react';
import HeaderIcons from './HeaderIcons.tsx';

interface DashboardHeaderProps {
  onOpenNav: () => void;
}

const GenericHeader = memo(function GenericHeader(props: DashboardHeaderProps) {
  const { onOpenNav } = props;

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

        <HeaderIcons />
      </StyledToolbar>
    </StyledRoot>
  );
});

export default GenericHeader;
