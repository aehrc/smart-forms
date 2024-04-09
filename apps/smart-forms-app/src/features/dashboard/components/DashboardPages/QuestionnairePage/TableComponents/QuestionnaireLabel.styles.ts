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
import type { Theme } from '@mui/material';
import { Box } from '@mui/material';

import type { QuestionnaireListItem } from '../../../../types/list.interface.ts';

const handleColorType = (color: QuestionnaireListItem['status'], theme: Theme) => {
  switch (color) {
    case 'draft':
      return theme.palette.warning.dark;
    case 'active':
      return theme.palette.success.dark;
    case 'retired':
      return theme.palette.error.dark;
    case 'unknown':
      return theme.palette.grey[700];
  }
};
const handleBgColorType = (color: QuestionnaireListItem['status'], theme: Theme) => {
  switch (color) {
    case 'draft':
      return alpha(theme.palette.warning.light, 0.16);
    case 'active':
      return alpha(theme.palette.success.light, 0.16);
    case 'retired':
      return alpha(theme.palette.error.light, 0.16);
    case 'unknown':
      return theme.palette.grey[300];
  }
};

export const QuestionnaireStyledLabel = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'color'
})<{ color: QuestionnaireListItem['status'] }>(({ theme, color }) => ({
  height: 24,
  minWidth: 22,
  lineHeight: 0,
  borderRadius: 6,
  alignItems: 'center',
  whiteSpace: 'nowrap',
  display: 'inline-flex',
  justifyContent: 'center',
  textTransform: 'capitalize',
  padding: theme.spacing(0, 1),
  fontSize: theme.typography.body1.fontSize,
  color: handleColorType(color, theme),
  backgroundColor: handleBgColorType(color, theme),
  fontWeight: theme.typography.fontWeightBold
}));
