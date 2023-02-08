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
import { Box } from '@mui/material';
import { ChipBarBox } from './ChipBar.styles';

function ChipBar(props: { children: React.ReactNode }) {
  const { children } = props;

  return (
    <Box sx={{ display: { xs: 'block', lg: 'none' } }} data-test="chip-bar-box">
      <ChipBarBox gap={1}>{children}</ChipBarBox>
    </Box>
  );
}

export default ChipBar;
