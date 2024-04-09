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

import React from 'react';
import { DeleteButtonTableCell } from './Table.styles';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import type { QuestionnaireResponseItem } from 'fhir/r4';

interface RemoveRowButtonProps {
  nullableQrItem: QuestionnaireResponseItem | null;
  numOfRows: number;
  readOnly: boolean;
  onRemoveItem: () => void;
}

function RemoveRowButton(props: RemoveRowButtonProps) {
  const { nullableQrItem, numOfRows, readOnly, onRemoveItem } = props;

  const isDisabled = nullableQrItem === null || numOfRows === 1 || readOnly;
  return (
    <DeleteButtonTableCell>
      <Tooltip title="Remove item">
        <span>
          <IconButton size="small" color="error" disabled={isDisabled} onClick={onRemoveItem}>
            <RemoveCircleOutlineIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </DeleteButtonTableCell>
  );
}

export default RemoveRowButton;
