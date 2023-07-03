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

import Iconify from '../../../../components/Iconify/Iconify.tsx';
import { useTheme } from '@mui/material/styles';
import DesktopHeader from '../../../../components/Header/DesktopHeader.tsx';
import useResponsive from '../../../../hooks/useResponsive.ts';
import Logo from '../../../../components/Logos/Logo.tsx';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import UpdatingIndicator from './UpdatingIndicator.tsx';
import MobileHeaderWithQuestionnaire from '../../../../components/Header/MobileHeaderWithQuestionnaire.tsx';
import { LogoWrapper } from '../../../../components/Logos/Logo.styles.ts';
import { StyledRoot, StyledToolbar } from '../../../../components/Header/Header.styles.ts';
import useQuestionnaireStore from '../../../../stores/useQuestionnaireStore.ts';

interface Props {
  navIsCollapsed: boolean;
  onOpenNav: () => void;
}

function RendererHeader(props: Props) {
  const { navIsCollapsed, onOpenNav } = props;

  const sourceQuestionnaire = useQuestionnaireStore((state) => state.sourceQuestionnaire);

  const theme = useTheme();
  const isDesktop = useResponsive('up', 'lg');

  const navIsExpanded = !navIsCollapsed;

  return (
    <StyledRoot sx={{ boxShadow: theme.customShadows.z4 }} navCollapsed={navIsCollapsed}>
      <StyledToolbar>
        <IconButton
          onClick={onOpenNav}
          sx={{
            mr: 1,
            color: 'text.primary',
            ...(navIsExpanded && { display: { lg: 'none' } })
          }}
          data-test="button-expand-nav">
          <Iconify icon="eva:menu-2-fill" />
        </IconButton>

        {isDesktop && navIsExpanded ? null : (
          <LogoWrapper>
            <Logo />
          </LogoWrapper>
        )}

        {isDesktop && navIsExpanded ? (
          <Box sx={{ px: 1 }}>
            <Typography variant="subtitle1" color="text.primary">
              {sourceQuestionnaire.title}
            </Typography>
          </Box>
        ) : null}
        <Box flexGrow={1} />
        <UpdatingIndicator />

        <Stack
          direction="row"
          alignItems="center"
          spacing={{
            xs: 0.5,
            sm: 1
          }}
          sx={{ color: theme.palette.grey['700'] }}>
          {isDesktop && navIsExpanded ? <DesktopHeader /> : <MobileHeaderWithQuestionnaire />}
        </Stack>
      </StyledToolbar>
    </StyledRoot>
  );
}

export default RendererHeader;
