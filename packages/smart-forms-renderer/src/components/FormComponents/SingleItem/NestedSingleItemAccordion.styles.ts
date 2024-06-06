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
import { AccordionSummary } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import Box from '@mui/material/Box';

export const NestedSingleItemAccordionWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isRepeated'
})<{ isRepeated: boolean }>(({ isRepeated }) => ({
  marginBottom: isRepeated ? 0 : '28px'
}));

export const NestedSingleItemAccordion = styled(Accordion, {
  shouldForwardProp: (prop) => prop !== 'elevation'
})<{ elevation: number }>(({ elevation }) => ({
  paddingTop: '8px',
  paddingBottom: '4px',
  paddingLeft: elevation === 1 ? '10px' : '8px',
  paddingRight: elevation === 1 ? '10px' : '8px'
}));

export const NestedSingleItemAccordionSummary = styled(AccordionSummary)(() => ({
  minHeight: '28px',
  '.MuiAccordionSummary-expandIconWrapper': {
    '&:hover:not(.Mui-disabled)': {
      cursor: 'pointer'
    }
  },
  '.MuiAccordionSummary-content': {
    marginBottom: 0
  },
  '&.Mui-focusVisible': {
    backgroundColor: 'transparent'
  },
  '&:hover:not(.Mui-disabled)': {
    cursor: 'default'
  }
}));
