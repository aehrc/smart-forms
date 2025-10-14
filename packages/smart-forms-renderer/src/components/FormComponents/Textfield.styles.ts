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

import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

/**
 * Always use this with the TextField `fullWidth` prop to ensure proper layout and alignment.
 */
export const StandardTextField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'isTabled' && prop !== 'textFieldWidth'
})<{ isTabled: boolean; textFieldWidth: number }>(({ isTabled, textFieldWidth }) => ({
  // Set textFieldWidth (defaults to 320 in rendererConfigStore) as the standard width for a field
  // Set a theoretical infinite maxWidth (3000) if field is within a table to fill the table row
  maxWidth: !isTabled ? textFieldWidth : 3000,
  minWidth: 160,
  '& .MuiInputBase-root': {
    padding: 0
  },
  '& .MuiInputBase-inputMultiline': {
    padding: '8.5px 14px', // match MUI input padding
    lineHeight: '1.5em'
  },
  // When text field is read-only, prevent text/input I-beam cursor
  '& .MuiOutlinedInput-root.Mui-readOnly': {
    cursor: 'default',
    '& .MuiInputBase-input': {
      cursor: 'default'
    }
  },
  '& .MuiOutlinedInput-root': {
    paddingRight: 6 // Down from the default 14px
  },
  '& .StandardTextField-clearIndicator': {
    // Hidden by default, visibility driven by "& .MuiOutlinedInput-root:hover .StandardTextField-clearIndicator"
    visibility: 'hidden'
  },
  '& .MuiOutlinedInput-root:hover .StandardTextField-clearIndicator': {
    visibility: 'visible'
  },
  '& .MuiOutlinedInput-root.Mui-focused .StandardTextField-clearIndicator': {
    visibility: 'visible'
  }
}));
