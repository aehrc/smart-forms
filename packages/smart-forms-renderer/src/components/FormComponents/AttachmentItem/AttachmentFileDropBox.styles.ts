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
import { Box } from '@mui/material';

export const AttachmentFileDropBoxWrapper = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== 'isActive' && prop !== 'isTabled' && prop !== 'textFieldWidth'
})<{ isActive: boolean; isTabled: boolean; textFieldWidth: number }>(
  ({ theme, isActive, isTabled, textFieldWidth }) => ({
    backgroundColor: theme.palette.background.paper,
    border: '2px dashed',
    borderColor: isActive ? theme.palette.secondary.main : theme.palette.primary.main,
    borderRadius: '4px',
    maxWidth: !isTabled ? textFieldWidth : 3000,
    minWidth: 160,
    ref: HTMLElement
  })
);
AttachmentFileDropBoxWrapper.displayName = 'AttachmentFileDropBoxWrapper';

// Forwarding ref to Box
// export const AttachmentFileDropBoxWrapper = React.forwardRef<
//   HTMLDivElement,
//   { isActive: boolean; isTabled: boolean; textFieldWidth: number }
// >(({ isActive, isTabled, textFieldWidth, ...props }, ref) => {
//   const StyledBox = styled(Box, {
//     shouldForwardProp: (prop) =>
//       prop !== 'isActive' && prop !== 'isTabled' && prop !== 'textFieldWidth'
//   })(({ theme }) => ({
//     backgroundColor: theme.palette.background.paper,
//     border: '2px dashed',
//     borderColor: isActive ? theme.palette.secondary.main : theme.palette.primary.main,
//     borderRadius: '4px',
//     maxWidth: !isTabled ? textFieldWidth : 3000,
//     minWidth: 160
//   }));

//   return <StyledBox ref={ref} {...props} />;
// });

// AttachmentFileDropBoxWrapper.displayName = 'AttachmentFileDropBoxWrapper';
