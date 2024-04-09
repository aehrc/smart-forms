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
import { RepeatDeleteTooltip } from './RepeatItem.styles';
import IconButton from '@mui/material/IconButton';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import type { QuestionnaireResponseItemAnswer } from 'fhir/r4';

interface RemoveItemButtonProps {
  answer: QuestionnaireResponseItemAnswer | null;
  numOfRepeatAnswers: number;
  readOnly: boolean;
  onDeleteAnswer: () => void;
}

function RemoveItemButton(props: RemoveItemButtonProps) {
  const { answer, numOfRepeatAnswers, readOnly, onDeleteAnswer } = props;

  const isDisabled = answer === null || numOfRepeatAnswers === 1 || readOnly;

  return (
    <RepeatDeleteTooltip className="repeat-item-delete" title="Remove item">
      <span>
        <IconButton size="small" color="error" disabled={isDisabled} onClick={onDeleteAnswer}>
          <RemoveCircleOutlineIcon fontSize="small" />
        </IconButton>
      </span>
    </RepeatDeleteTooltip>
  );
}

export default RemoveItemButton;
