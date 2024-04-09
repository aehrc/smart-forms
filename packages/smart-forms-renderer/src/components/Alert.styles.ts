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
import Box from '@mui/material/Box';
import ListItemIcon from '@mui/material/ListItemIcon';

export const StyledAlert = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'color'
})<{ color: 'info' | 'error' }>(({ theme, color }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.25),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: alpha(
    color === 'error' ? theme.palette.error.light : theme.palette.info.light,
    0.12
  ),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(1.5)
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(2)
  }
}));

export const StyledNavItemIcon = styled(ListItemIcon)({
  color: 'inherit',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});
