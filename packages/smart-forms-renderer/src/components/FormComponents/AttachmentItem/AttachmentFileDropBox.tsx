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

import { Box, Typography } from '@mui/material';
import useFileDrop from '../../../hooks/UseFileDrop';
import { AttachmentFileDropBoxWrapper } from './AttachmentFileDropBox.styles';
import React from 'react';
import type { PropsWithIsTabledAttribute } from '../../../interfaces/renderProps.interface';
import { getFileSize } from '../../../utils/fileUtils';

export interface AttachmentFileDropBoxProps extends PropsWithIsTabledAttribute {
  file: File | null;
  onDrop: (item: { files: any[] }) => void;
  errorMessage: string;
}

function AttachmentFileDropBox(props: AttachmentFileDropBoxProps) {
  const { file, onDrop, errorMessage, isTabled } = props;

  const { canDrop, isOver, dropTarget } = useFileDrop(onDrop);

  const isActive = canDrop && isOver;

  let boxMessage = 'No file selected';
  if (isActive) {
    boxMessage = 'Release to drop file';
  } else if (errorMessage) {
    boxMessage = errorMessage;
  } else if (file) {
    boxMessage = file.name;
  }

  return (
    <AttachmentFileDropBoxWrapper
      ref={dropTarget}
      display="flex"
      isActive={isActive}
      isTabled={isTabled}>
      <Box p={1.5}>
        <Typography>{boxMessage}</Typography>
        {file ? (
          <Box pt={1}>
            <Typography fontSize={10}>Size: {getFileSize(file.size.toString() ?? '0')}</Typography>
            <Typography fontSize={10}>Type: {file.type}</Typography>
          </Box>
        ) : null}
      </Box>
    </AttachmentFileDropBoxWrapper>
  );
}

export default AttachmentFileDropBox;
