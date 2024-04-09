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
import { Box, ListItemButton, ListItemIcon, Stack, Typography } from '@mui/material';

export const NavSectionWrapper = styled(Box)({
  paddingBottom: '32px'
});

export const NavSectionHeadingWrapper = styled(Box)({
  padding: '0px 20px 6px 20px'
});

export const NavSectionHeading = styled(Typography)(({ theme }) => ({
  ...theme.typography.overline,
  color: theme.palette.text.secondary
}));

export const NavListItemButton = styled(ListItemButton)(({ theme }) => ({
  ...theme.typography.subtitle2,
  height: 46,
  textTransform: 'capitalize',
  color: theme.palette.text.secondary,
  borderRadius: Number(theme.shape.borderRadius)
}));

export const NavErrorAlertWrapper = styled(Box)({
  padding: '80px 20px 80px 20px'
});

export const NavMiddleWrapper = styled(Stack)({
  padding: '80px 20px 80px 20px'
});

export const NavPatientDetailsWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  marginLeft: theme.spacing(2.25),
  marginRight: theme.spacing(2.25),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(6),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: alpha(theme.palette.primary.light, 0.12)
}));

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
