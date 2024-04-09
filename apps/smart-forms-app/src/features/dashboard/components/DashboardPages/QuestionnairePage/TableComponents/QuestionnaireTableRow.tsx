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
import QuestionnaireLabel from './QuestionnaireLabel.tsx';
import type { QuestionnaireListItem } from '../../../../types/list.interface.ts';
import { StyledAvatar } from './QuestionnaireTable.styles.ts';

interface QuestionnaireTableRowProps {
  row: QuestionnaireListItem;
  isSelected: boolean;
  onRowClick: () => void;
}
function QuestionnaireTableRow(props: QuestionnaireTableRowProps) {
  const { row, isSelected, onRowClick } = props;

  const { title, avatarColor, publisher, date, status } = row;
  return (
    <TableRow
      hover
      tabIndex={-1}
      selected={isSelected}
      sx={{ cursor: 'pointer' }}
      data-test="questionnaire-list-row"
      onClick={onRowClick}>
      <TableCell padding="checkbox">
        <StyledAvatar avatarColor={avatarColor}>
          <AssignmentIcon />
        </StyledAvatar>
      </TableCell>

      <TableCell scope="row" sx={{ maxWidth: 240 }}>
        <Typography variant="subtitle2">{title}</Typography>
      </TableCell>

      <TableCell>{publisher}</TableCell>

      <TableCell>{date ? dayjs(date).format('LL') : '-'}</TableCell>

      <TableCell>
        <QuestionnaireLabel color={status}>{status}</QuestionnaireLabel>
      </TableCell>
    </TableRow>
  );
}

export default QuestionnaireTableRow;
