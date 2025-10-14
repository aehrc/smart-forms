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

import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import type { ChangeEvent } from 'react';
import type { PropsWithIsTabledAttribute } from '../../../../interfaces/renderProps.interface';
import { useRendererConfigStore } from '../../../../stores';
import FormControl from '@mui/material/FormControl';
import MuiTextField from '../../TextItem/MuiTextField';

interface CustomTimeFieldProps extends PropsWithIsTabledAttribute {
  linkId: string;
  itemType: string;
  timeInput: string;
  periodInput: string;
  is24HourNotation: boolean;
  feedback: string;
  displayPrompt: string;
  readOnly: boolean;
  calcExpUpdated: boolean;
  isPartOfDateTime: boolean;
  onTimeInputChange: (newInput: string) => void;
  onPeriodChange: (newPeriod: string) => void;
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
    onPeriodChange
  } = props;
  // TODO this component doesn't have a calcExpUpdated update animation

  const readOnlyVisualStyle = useRendererConfigStore.use.readOnlyVisualStyle();
  const textFieldWidth = useRendererConfigStore.use.textFieldWidth();

  // If this reusable time field is part of a DateTime component, do not assign an id to the wrapping <Box/>
  // If this reusable time field is from a Time component, the wrapping <Box/> should have an id
  const itemId = isPartOfDateTime ? undefined : itemType + '-' + linkId;

  const timeId = itemType + '-' + linkId + '-time';
  const periodId = itemType + '-' + linkId + '-period';

  return (
    <>
      <Box
        id={itemId}
        display="flex"
        alignItems="center"
        columnGap={1}
        sx={{ maxWidth: !isTabled ? textFieldWidth : 3000, minWidth: 160 }}>
        <MuiTextField
          data-test={'time'}
          id={timeId}
          value={timeInput}
          error={!!feedback}
          fullWidth
          sx={{ flex: 1 }}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onTimeInputChange(e.target.value)}
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
        <FormControl sx={{ flex: 1 }}>
          <Select
            data-test={'ampm'}
            id={periodId}
            value={is24HourNotation ? '' : periodInput}
            error={!!feedback}
            disabled={(readOnly && readOnlyVisualStyle === 'disabled') || is24HourNotation}
            readOnly={(readOnly && readOnlyVisualStyle === 'readonly') || is24HourNotation}
            displayEmpty
            size="small"
            onChange={(e) => onPeriodChange(e.target.value)}>
            <MenuItem value="">
              <span style={{ color: grey['500'] }}>{is24HourNotation ? '-' : 'AM/PM'}</span>
            </MenuItem>
            <MenuItem value="AM">AM</MenuItem>
            <MenuItem value="PM">PM</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Typography component="span" variant="caption" color="error" sx={{ ml: 1.75, mt: -0.5 }}>
        {feedback}
      </Typography>
    </>
  );
}

export default CustomTimeField;
