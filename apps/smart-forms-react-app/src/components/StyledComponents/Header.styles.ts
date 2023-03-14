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

import { alpha, styled } from '@mui/material/styles';
import { AppBar, Toolbar } from '@mui/material';

const NAV_WIDTH = 240;

const HEADER_MOBILE = 64;

const HEADER_DESKTOP = 72;

export const StyledRoot = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'navCollapsed'
})<{ navCollapsed?: boolean }>(({ theme, navCollapsed }) => ({
  backdropFilter: `blur(2.25px)`,
  WebkitBackdropFilter: `blur(2.25px)`,
  backgroundColor: alpha(theme.palette.background.default, 0.8),
  boxShadow: 'none',
  [theme.breakpoints.up('lg')]: {
    width: navCollapsed ? '100%' : `calc(100% - ${NAV_WIDTH + 1}px)`
  }
}));

export const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  minHeight: HEADER_MOBILE,
  [theme.breakpoints.up('lg')]: {
    minHeight: HEADER_DESKTOP,
    padding: theme.spacing(0, 4)
  }
}));
