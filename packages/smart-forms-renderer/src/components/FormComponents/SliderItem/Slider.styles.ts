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
import { Box } from '@mui/material';

export const SliderDisplayBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'hasLabels'
})<{ hasLabels: boolean }>(({ theme, hasLabels }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
  marginBottom: hasLabels ? -20 : 0,
  padding: theme.spacing(0.5),
  borderRadius: Number(theme.shape.borderRadius) * 0.5,
  border: `1px solid ${alpha(theme.palette.text.disabled, 0.5)}`,
  minWidth: 28,
  height: 18
}));
