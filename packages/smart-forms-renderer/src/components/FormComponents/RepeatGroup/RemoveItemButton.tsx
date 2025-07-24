/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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
import { RepeatRemoveTooltip } from '../RepeatItem/RepeatItem.styles';
import IconButton from '@mui/material/IconButton';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import type { QuestionnaireResponseItem } from 'fhir/r4';

interface RemoveItemButtonProps {
  nullableQrItem: QuestionnaireResponseItem | null;
  numOfRepeatGroups: number;
  readOnly: boolean;
  onRemoveItem: () => void;
}

function RemoveItemButton(props: RemoveItemButtonProps) {
  const { nullableQrItem, numOfRepeatGroups, readOnly, onRemoveItem } = props;

  const isDisabled = nullableQrItem === null || numOfRepeatGroups === 1 || readOnly;

  return (
    <RepeatRemoveTooltip title="Remove item">
      <span role="button">
        <IconButton
          size="small"
          color="error"
          disabled={isDisabled}
          onClick={onRemoveItem}
          aria-label="Remove item">
          <RemoveCircleOutlineIcon />
        </IconButton>
      </span>
    </RepeatRemoveTooltip>
  );
}

export default RemoveItemButton;
