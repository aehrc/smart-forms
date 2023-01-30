/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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

import { OutlinedInput, styled, TextField } from '@mui/material';

// Always use this accompanied by the TextField prop fullWidth
export const StandardTextField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'isTabled'
})<{ isTabled: boolean }>(({ isTabled }) => ({
  // Set 280 as the standard width for a field
  // Set a theoretical infinite maxWidth if field is within a table to fill the table row
  maxWidth: !isTabled ? 280 : 3000
}));

export const StandardOutlinedInput = styled(OutlinedInput, {
  shouldForwardProp: (prop) => prop !== 'isTabled'
})<{ isTabled: boolean }>(({ isTabled }) => ({
  // Set 280 as the standard width for a field
  // Set a theoretical infinite maxWidth if field is within a table to fill the table row
  maxWidth: !isTabled ? 280 : 3000
}));
