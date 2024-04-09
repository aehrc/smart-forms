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

import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';

export const RepeatDeleteTooltip = styled(Tooltip)(() => ({
  marginLeft: 8
}));

export const RepeatItemContainerStack = styled(Stack)(() => ({
  alignItems: 'center',
  paddingBottom: 8
}));

export const RepeatGroupContainerStack = styled(Stack)(() => ({
  alignItems: 'center',
  paddingBottom: 16
}));
