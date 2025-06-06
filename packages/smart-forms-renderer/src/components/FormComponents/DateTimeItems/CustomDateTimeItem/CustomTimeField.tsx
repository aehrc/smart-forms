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

import type { ChangeEvent } from 'react';
import React from 'react';
import type { PropsWithIsTabledRequiredAttribute } from '../../../../interfaces/renderProps.interface';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import MuiTextField from '../../TextItem/MuiTextField';
import { grey } from '@mui/material/colors';
import Typography from '@mui/material/Typography';
import { useRendererStylingStore } from '../../../../stores';

interface CustomTimeFieldProps extends PropsWithIsTabledRequiredAttribute {
  linkId: string;
  itemType: string;
  timeInput: string;
  periodInput: string;
  is24HourNotation: boolean;
  feedback: string;
  displayPrompt: string;
  readOnly: boolean;
  isPartOfDateTime: boolean;
  onTimeInputChange: (newInput: string) => void;
  onPeriodChange: (newPeriod: string) => void;
  onTimeBlur: () => void;
}

function CustomTimeField(props: CustomTimeFieldProps) {
  const {
    linkId,
    itemType,
    timeInput,
    periodInput,
    is24HourNotation,
    feedback,
    displayPrompt,
    readOnly,
    isPartOfDateTime,
    isTabled,
    onTimeInputChange,
    onPeriodChange,
    onTimeBlur
  } = props;

  const readOnlyVisualStyle = useRendererStylingStore.use.readOnlyVisualStyle();
  const textFieldWidth = useRendererStylingStore.use.textFieldWidth();

  // If this reusable time field is part of a DateTime component, do not assign an id to the wrapping <Box/>
  // If this reusable time field is from a Time component, the wrapping <Box/> should have an id
  const itemId = isPartOfDateTime ? undefined : itemType + '-' + linkId;

  const timeId = itemType + '-' + linkId + '-time';
  const periodId = itemType + '-' + linkId + '-period';

  return (
    <Tooltip title={isTabled ? feedback : ''}>
      <>
        <Box
          id={itemId}
          display="flex"
          alignItems="center"
          columnGap={1}
          sx={{ maxWidth: !isTabled ? textFieldWidth : 3000, minWidth: 160 }}>
          <MuiTextField
            id={timeId}
            value={timeInput}
            error={!!feedback}
            fullWidth
            sx={{ flex: 1 }}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onTimeInputChange(e.target.value)}
            onBlur={onTimeBlur}
            label={displayPrompt}
            placeholder="--:--"
            disabled={readOnly && readOnlyVisualStyle === 'disabled'}
            size="small"
            slotProps={{
              input: {
                readOnly: readOnly && readOnlyVisualStyle === 'readonly'
              }
            }}
          />
          <Select
            id={periodId}
            value={is24HourNotation ? '' : periodInput}
            error={!!feedback}
            disabled={(readOnly && readOnlyVisualStyle === 'disabled') || is24HourNotation}
            readOnly={(readOnly && readOnlyVisualStyle === 'readonly') || is24HourNotation}
            displayEmpty
            size="small"
            sx={{ flex: 1 }}
            onChange={(e) => onPeriodChange(e.target.value)}
            onBlur={onTimeBlur}>
            <MenuItem value="">
              <span style={{ color: grey['500'] }}>{is24HourNotation ? '-' : 'AM/PM'}</span>
            </MenuItem>
            <MenuItem value="AM">AM</MenuItem>
            <MenuItem value="PM">PM</MenuItem>
          </Select>
        </Box>
        <Typography component="span" variant="caption" color="error" sx={{ ml: 1.75, mt: -0.5 }}>
          {isTabled ? '' : feedback}
        </Typography>
      </>
    </Tooltip>
  );
}

export default CustomTimeField;
