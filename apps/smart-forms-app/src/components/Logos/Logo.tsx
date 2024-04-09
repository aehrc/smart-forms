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

import { memo } from 'react';
import { Box, Typography } from '@mui/material';
import AppLogo from '../../data/images/logo.svg';
import useResponsive from '../../hooks/useResponsive.ts';

interface LogoProps {
  isNav?: boolean;
  isRendererHeader?: boolean;
}

const Logo = memo(function Logo(props: LogoProps) {
  const { isNav, isRendererHeader } = props;

  const isDesktop = useResponsive('up', 'lg');

  const showLogoNameOnHeader = isDesktop && !isRendererHeader;

  return (
    <Box display="flex" alignItems="center" columnGap={1.5}>
      <Box component="img" src={AppLogo} display="inline-flex" width={36} height={36} />
      {showLogoNameOnHeader || isNav ? <Typography variant="h6">Smart Forms</Typography> : null}
    </Box>
  );
});

export default Logo;
