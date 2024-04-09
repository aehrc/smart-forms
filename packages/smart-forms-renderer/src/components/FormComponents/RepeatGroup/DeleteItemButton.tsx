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
import { RepeatDeleteTooltip } from '../RepeatItem/RepeatItem.styles';
import IconButton from '@mui/material/IconButton';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import type { QuestionnaireResponseItem } from 'fhir/r4';

interface DeleteItemButtonProps {
  nullableQrItem: QuestionnaireResponseItem | null;
  numOfRepeatGroups: number;
  readOnly: boolean;
  onDeleteItem: () => void;
}

function DeleteItemButton(props: DeleteItemButtonProps) {
  const { nullableQrItem, numOfRepeatGroups, readOnly, onDeleteItem } = props;

  const isDisabled = nullableQrItem === null || numOfRepeatGroups === 1 || readOnly;

  return (
    <RepeatDeleteTooltip className="repeat-group-delete" title="Remove item">
      <span>
        <IconButton size="small" color="error" disabled={isDisabled} onClick={onDeleteItem}>
          <RemoveCircleOutlineIcon />
        </IconButton>
      </span>
    </RepeatDeleteTooltip>
  );
}

export default DeleteItemButton;
