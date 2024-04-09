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
import { Paper } from '@mui/material';

const FOOTER_MOBILE = 20;

const FOOTER_DESKTOP = 20;

export const StyledRoot = styled(Paper)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.default, 0.1),
  minHeight: FOOTER_MOBILE,
  width: '100%',
  [theme.breakpoints.up('lg')]: {
    minHeight: FOOTER_DESKTOP
  },
  position: 'fixed',
  bottom: 0,
  right: 0
}));
