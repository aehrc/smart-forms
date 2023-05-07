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

import { Box, Chip, styled } from '@mui/material';
import { grey } from '@mui/material/colors';

export const ChipBarBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  '& .MuiButtonBase-root': {
    backgroundColor: grey.A200,
    '&:hover': {
      transition: '0.2s',
      color: theme.palette.secondary.dark,
      backgroundColor: theme.palette.accent2.light,
      '& .MuiSvgIcon-root': {
        color: theme.palette.secondary.dark
      }
    }
  }
}));

export const OperationChip = styled(Chip)(() => ({
  paddingLeft: 4,
  paddingRight: 4
}));
