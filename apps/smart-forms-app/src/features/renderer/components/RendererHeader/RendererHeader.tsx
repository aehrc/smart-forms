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

import Iconify from '../../../../components/Iconify/Iconify.tsx';
import { useTheme } from '@mui/material/styles';
import Logo from '../../../../components/Logos/Logo.tsx';
import { Box, IconButton, Typography } from '@mui/material';
import UpdatingIndicator from './UpdatingIndicator.tsx';
import { LogoWrapper } from '../../../../components/Logos/Logo.styles.ts';
import { StyledRoot, StyledToolbar } from '../../../../components/Header/Header.styles.ts';
import { memo } from 'react';
import HeaderIcons from '../../../../components/Header/HeaderIcons.tsx';
import { useQuestionnaireStore, useResponsive } from '@aehrc/smart-forms-renderer';
import TokenTimer from '../../../tokenTimer/components/TokenTimer.tsx';

interface RendererHeaderProps {
  desktopNavCollapsed: boolean;
  onOpenMobileNav: () => void;
}

const RendererHeader = memo(function RendererHeader(props: RendererHeaderProps) {
  const { desktopNavCollapsed, onOpenMobileNav } = props;

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();

  const theme = useTheme();
  const isLgUp = useResponsive({ query: 'up', start: 'lg' });

  const navIsExpanded = !desktopNavCollapsed;

  return (
    <StyledRoot sx={{ boxShadow: theme.shadows[4] }} navCollapsed={desktopNavCollapsed}>
      <StyledToolbar>
        {isLgUp ? (
          <IconButton
            aria-label="Expand navigation"
            onClick={onOpenMobileNav}
            sx={{
              color: 'text.primary',
              ...(navIsExpanded && { display: { lg: 'none' } })
            }}
            data-test="button-expand-nav">
            <Iconify icon="eva:menu-2-fill" />
          </IconButton>
        ) : null}

        {isLgUp && navIsExpanded ? null : (
          <LogoWrapper>
            <Logo isRendererHeader />
          </LogoWrapper>
        )}

        <Box m={0.5}>
          <Typography variant="subtitle1" color="text.primary" fontSize={isLgUp ? 13 : 11}>
            {sourceQuestionnaire.title}
          </Typography>
        </Box>
        <Box flexGrow={1} />

        <UpdatingIndicator />
        <TokenTimer />

        <HeaderIcons />
      </StyledToolbar>
    </StyledRoot>
  );
});

export default RendererHeader;
