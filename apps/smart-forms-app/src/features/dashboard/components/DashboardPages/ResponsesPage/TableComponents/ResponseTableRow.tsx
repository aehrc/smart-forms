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

import { TableCell, TableRow, Typography } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import dayjs from 'dayjs';
import type { ResponseListItem } from '../../../../types/list.interface.ts';
import ResponseLabel from './ResponseLabel.tsx';
import { StyledAvatar } from '../../QuestionnairePage/TableComponents/QuestionnaireTable.styles.ts';

interface ResponseTableRowProps {
  row: ResponseListItem;
  isSelected: boolean;
  onRowClick: () => void;
}

function ResponseTableRow(props: ResponseTableRowProps) {
  const { row, isSelected, onRowClick } = props;

  const { title, avatarColor, author, authored, status } = row;

  const authoredString = dayjs(authored).format('LLL');

  return (
    <TableRow
      hover
      tabIndex={-1}
      selected={isSelected}
      sx={{ cursor: 'pointer' }}
      data-test="response-list-row"
      onClick={onRowClick}>
      <TableCell padding="checkbox">
        <StyledAvatar avatarColor={avatarColor}>
          <AssignmentIcon />
        </StyledAvatar>
      </TableCell>

      <TableCell scope="row" sx={{ maxWidth: 240 }}>
        <Typography variant="subtitle2" sx={{ textTransform: 'Capitalize' }}>
          {title}
        </Typography>
      </TableCell>

      <TableCell align="left" sx={{ textTransform: 'Capitalize' }}>
        {author}
      </TableCell>

      <TableCell align="left" sx={{ textTransform: 'Capitalize' }}>
        {authoredString}
      </TableCell>

      <TableCell align="left">
        <ResponseLabel color={status} data-test="response-label">
          {status}
        </ResponseLabel>
      </TableCell>
    </TableRow>
  );
}

export default ResponseTableRow;
