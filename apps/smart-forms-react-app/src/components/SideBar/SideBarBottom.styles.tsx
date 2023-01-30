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

import { Box, IconButton, styled } from '@mui/material';

export const OrganisationLogoBox = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
  padding: 9
}));

export const SideBarExpandButtonBox = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'end',
  padding: 3
}));

export const SideBarIconButton = styled(IconButton)(({ theme }) => ({
  '&:hover, &.Mui-focusVisible': {
    backgroundColor: theme.palette.accent2.light,
    '&.MuiButtonBase-root': {
      color: theme.palette.secondary.dark
    }
  },
  '&.MuiButtonBase-root': {
    color: '#444746'
  }
}));
