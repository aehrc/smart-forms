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

import List from '@mui/material/List';
import { alpha, styled } from '@mui/material/styles';

export const PrimarySelectableList = styled(List)(({ theme }) => ({
  '&& .Mui-selected': {
    color: theme.palette.primary.dark,
    backgroundColor: alpha(theme.palette.primary.main, 0.15),
    borderRadius: 30,
    '& .MuiTypography-root': {
      fontWeight: 'bold'
    }
  },
  '& .MuiListItemButton-root': {
    color: theme.palette.text.primary,
    borderRadius: 30
  },
  '& .MuiListItemButton-root:hover': {
    color: theme.palette.primary.dark,
    backgroundColor: alpha(theme.palette.primary.main, 0.09),
    borderRadius: 30
  }
}));
