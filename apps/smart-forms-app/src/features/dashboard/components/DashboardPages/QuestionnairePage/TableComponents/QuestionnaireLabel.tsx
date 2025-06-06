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

import type { ReactNode } from 'react';
import { forwardRef } from 'react';
import type { SxProps, Theme } from '@mui/material';
import { Box } from '@mui/material';
import { QuestionnaireStyledLabel } from './QuestionnaireLabel.styles.ts';

import type { QuestionnaireListItem } from '../../../../types/list.interface.ts';

interface QuestionnaireLabelProps {
  color: QuestionnaireListItem['status'];
  children: ReactNode;
  endIcon?: ReactNode;
  startIcon?: ReactNode;
  sx?: SxProps<Theme>;
}

const QuestionnaireLabel = forwardRef((props: QuestionnaireLabelProps, ref) => {
  const { color, startIcon, endIcon, children, sx, ...other } = props;

  const iconStyle = {
    width: 16,
    height: 16,
    '& svg, img': { width: 1, height: 1, objectFit: 'cover' }
  };

  return (
    <QuestionnaireStyledLabel
      ref={ref}
      as="span"
      color={color}
      sx={{
        ...(startIcon && { pl: 0.75 }),
        ...(endIcon && { pr: 0.75 }),
        ...sx
      }}
      {...other}>
      {startIcon && <Box sx={{ mr: 0.75, ...iconStyle }}> {startIcon} </Box>}

      {children}

      {endIcon && <Box sx={{ ml: 0.75, ...iconStyle }}> {endIcon} </Box>}
    </QuestionnaireStyledLabel>
  );
});

QuestionnaireLabel.displayName = 'QuestionnaireLabel';

export default QuestionnaireLabel;
