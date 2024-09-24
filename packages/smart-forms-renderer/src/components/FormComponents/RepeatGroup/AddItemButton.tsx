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
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import type { RepeatGroupSingleModel } from '../../../interfaces/repeatGroup.interface';

interface AddItemButtonProps {
  repeatGroups: RepeatGroupSingleModel[];
  readOnly: boolean;
  onAddItem: () => void;
}

function AddItemButton(props: AddItemButtonProps) {
  const { repeatGroups, readOnly, onAddItem } = props;

  const isDisabled = repeatGroups[repeatGroups.length - 1]?.qrItem === null || readOnly;

  return (
    <Box display="flex" flexDirection="row-reverse">
      <Button
        variant="contained"
        size="small"
        startIcon={<AddIcon />}
        disabled={isDisabled}
        onClick={onAddItem}
        data-test="button-add-repeat-item">
        Add Item
      </Button>
    </Box>
  );
}

export default AddItemButton;
