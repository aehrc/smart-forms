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

import { Box, styled } from '@mui/material';
import { HEADER_DESKTOP_HEIGHT, HEADER_MOBILE_HEIGHT } from '../Header/Header.styles.ts';

export const StyledRoot = styled(Box)({
  display: 'flex',
  minHeight: '100%',
  overflow: 'hidden'
});

export const Main = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: '100%',
  paddingTop: HEADER_MOBILE_HEIGHT + 8,
  paddingBottom: theme.spacing(3),
  [theme.breakpoints.up('md')]: {
    paddingTop: HEADER_DESKTOP_HEIGHT + 12,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  [theme.breakpoints.up('lg')]: {
    paddingTop: HEADER_DESKTOP_HEIGHT + 16,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  }
}));
