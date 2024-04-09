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
import Typography from '@mui/material/Typography';
import { pxToRem } from '../../../theme/typography';
import Box from '@mui/material/Box';

interface SliderLabelsProps {
  minLabel: string;
  maxLabel: string;
}

function SliderLabels(props: SliderLabelsProps) {
  const { minLabel, maxLabel } = props;

  if (!minLabel && !maxLabel) {
    return null;
  }

  return (
    <Box display="flex" justifyContent="space-between" pb={0.5}>
      {[minLabel, maxLabel].map((label, index) => (
        <Typography
          key={index}
          textAlign="center"
          fontSize={pxToRem(10)}
          sx={{
            transform: `translateX(${index === 0 ? '-50%' : '50%'})`,
            wordWrap: 'break-word'
          }}>
          {label}
        </Typography>
      ))}
    </Box>
  );
}

export default SliderLabels;
