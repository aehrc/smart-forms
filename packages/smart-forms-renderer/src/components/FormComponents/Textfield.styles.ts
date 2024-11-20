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

import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

// Always use this accompanied by the TextField prop fullWidth
export const StandardTextField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'isTabled' && prop !== 'textFieldWidth'
})<{ isTabled: boolean; textFieldWidth: number }>(({ isTabled, textFieldWidth }) => ({
  // Set textFieldWidth (defaults to 320 in rendererStylingStore) as the standard width for a field
  // Set a theoretical infinite maxWidth (3000) if field is within a table to fill the table row
  maxWidth: !isTabled ? textFieldWidth : 3000,
  minWidth: 160
}));
