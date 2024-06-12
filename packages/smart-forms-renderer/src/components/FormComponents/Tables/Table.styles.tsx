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

import { styled } from '@mui/material/styles';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { grey } from '@mui/material/colors';

export const HeaderTableCell = styled(TableCell)(() => ({
  fontSize: 13,
  lineHeight: 'normal'
}));

export const StandardTableCell = styled(TableCell, {
  shouldForwardProp: (prop) => prop !== 'numOfColumns'
})<{ numOfColumns: number }>(({ numOfColumns }) => ({
  width: `${100 / numOfColumns}%`,
  paddingLeft: 4,
  paddingRight: 4
}));

export const DeleteButtonTableCell = styled(TableCell)(() => ({
  paddingLeft: 0,
  paddingRight: 4
}));

export const GridTextTableCell = styled(TableCell)(({ theme }) => ({
  width: '20%',
  paddingLeft: '18px',
  paddingRight: '18px',
  color: theme.palette.text.secondary
}));

export const GridAnswerTableCell = styled(TableCell, {
  shouldForwardProp: (prop) => prop !== 'numOfColumns'
})<{ numOfColumns: number }>(({ numOfColumns }) => ({
  width: `${80 / numOfColumns}%`,
  paddingLeft: 5,
  paddingRight: 5
}));

export const StyledGroupTableRow = styled(TableRow, {
  shouldForwardProp: (prop) =>
    prop !== 'itemIsDragged' && prop !== 'itemIsSelected' && prop !== 'hoverDisabled'
})<{ itemIsDragged: boolean; itemIsSelected: boolean; hoverDisabled: boolean }>(
  ({ theme, itemIsDragged, itemIsSelected, hoverDisabled }) => ({
    backgroundColor: itemIsSelected ? '#f4f8ff' : '#fff',
    ...(hoverDisabled
      ? {}
      : {
          '&.MuiTableRow-root:hover': {
            backgroundColor: itemIsSelected ? '#e9f1ff' : grey['50']
          }
        }),
    ...(itemIsDragged
      ? {
          boxShadow: theme.customShadows.z8,
          opacity: 1,
          backgroundColor: itemIsSelected ? '#edf4ff' : '#fafafa'
        }
      : {})
  })
);
