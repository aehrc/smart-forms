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

import React from 'react';
import { ReadOnlyLabel, RequiredLabel } from '../../Box.styles';
import Box from '@mui/material/Box';

interface ItemExtensionLabelsProps {
  required: boolean;
  readOnly: boolean;
}

function ItemExtensionLabels(props: ItemExtensionLabelsProps) {
  const { required, readOnly } = props;

  if (!required && !readOnly) {
    return null;
  }

  return (
    <Box display="flex" columnGap={0.5}>
      {required ? <RequiredLabel>Required</RequiredLabel> : null}
      {readOnly ? <ReadOnlyLabel>Read-only</ReadOnlyLabel> : null}
    </Box>
  );
}

export default ItemExtensionLabels;
