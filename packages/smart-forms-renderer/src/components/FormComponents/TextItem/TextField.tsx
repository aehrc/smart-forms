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
import InputAdornment from '@mui/material/InputAdornment';
import MuiTextField from './MuiTextField';
import FadingCheckIcon from '../ItemParts/FadingCheckIcon';
import Box from '@mui/material/Box';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import Tooltip from '@mui/material/Tooltip';
import { IconButton } from '@mui/material';

interface TextFieldProps {
  linkId: string;
  input: string;
  feedback: string;
  displayPrompt: string;
  displayUnit: string;
  entryFormat: string;
  readOnly: boolean;
  calculationStatus: 'on' | 'off' | null;
  calcExpUpdated: boolean;
  onInputChange: (value: string) => void;
  onResetCalculationStatus: () => void;
}

function TextField(props: TextFieldProps) {
  const {
    linkId,
    input,
    feedback,
    displayPrompt,
    displayUnit,
    entryFormat,
    readOnly,
    calculationStatus,
    calcExpUpdated,
    onInputChange,
    onResetCalculationStatus
  } = props;

  return (
    <Box display="flex" alignItems="center">
      <MuiTextField
        id={linkId}
        value={input}
        error={!!feedback}
        onChange={(event) => onInputChange(event.target.value)}
        disabled={readOnly}
        label={displayPrompt}
        placeholder={entryFormat}
        fullWidth
        multiline
        size="small"
        minRows={3}
        InputProps={{
          endAdornment: (
            <InputAdornment position={'end'}>
              <FadingCheckIcon fadeIn={calcExpUpdated} disabled={readOnly} />
              {displayUnit}
            </InputAdornment>
          )
        }}
        helperText={feedback}
        data-test="q-item-text-field"
      />
      {calculationStatus === 'on' ? (
        <Tooltip title="Answer is calculation-driven">
          <span>
            <CalculateOutlinedIcon color="disabled" fontSize="small" sx={{ m: '5px', ml: '9px' }} />
          </span>
        </Tooltip>
      ) : null}

      {calculationStatus === 'off' ? (
        <Tooltip title="Reset answer to be calculation-driven">
          <span>
            <IconButton
              size="small"
              color="primary"
              sx={{ ml: 0.5, mb: 0.5 }}
              onClick={onResetCalculationStatus}>
              <CalculateOutlinedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      ) : null}
    </Box>
  );
}

export default TextField;
