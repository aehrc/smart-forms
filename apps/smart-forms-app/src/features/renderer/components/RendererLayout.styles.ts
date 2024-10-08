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
import {
  HEADER_DESKTOP_HEIGHT,
  HEADER_MOBILE_HEIGHT
} from '../../../components/Header/Header.styles.ts';

export const Main = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  minHeight: '100%',
  paddingTop: HEADER_MOBILE_HEIGHT + 16,
  paddingBottom: theme.spacing(4),
  [theme.breakpoints.up('sm')]: {
    paddingTop: HEADER_DESKTOP_HEIGHT + 16
  }
}));
