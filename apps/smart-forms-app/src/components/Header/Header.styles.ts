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

import { alpha, styled } from '@mui/material/styles';
import { AppBar, IconButton, Toolbar } from '@mui/material';

export const NAV_WIDTH = 228;
export const HEADER_MOBILE_HEIGHT = 52;
export const HEADER_DESKTOP_HEIGHT = 60;

export const MenuIconButton = styled(IconButton)(({ theme }) => ({
  paddingRight: '8px',
  color: theme.palette.text.primary,
  [theme.breakpoints.up('lg')]: {
    display: 'none'
  }
}));

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
  height: HEADER_MOBILE_HEIGHT,
  padding: theme.spacing(0, 1),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(0, 2)
  },
  [theme.breakpoints.up('lg')]: {
    minHeight: HEADER_DESKTOP_HEIGHT,
    padding: theme.spacing(0, 4)
  }
}));
