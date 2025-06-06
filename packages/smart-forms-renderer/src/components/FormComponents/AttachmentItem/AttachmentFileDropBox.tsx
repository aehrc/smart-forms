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
import type { PropsWithIsTabledRequiredAttribute } from '../../../interfaces/renderProps.interface';
import { getFileSize } from '../../../utils/fileUtils';
import { useRendererStylingStore } from '../../../stores';

export interface AttachmentFileDropBoxProps extends PropsWithIsTabledRequiredAttribute {
  file: File | null;
  onDrop: (item: { files: any[] }) => void;
  errorMessage: string;
  readOnly: boolean;
}

function AttachmentFileDropBox(props: AttachmentFileDropBoxProps) {
  const { file, onDrop, errorMessage, readOnly, isTabled } = props;

  const readOnlyVisualStyle = useRendererStylingStore.use.readOnlyVisualStyle();
  const textFieldWidth = useRendererStylingStore.use.textFieldWidth();

  const readOnlyTextColor = readOnlyVisualStyle === 'disabled' ? 'text.disabled' : 'text.secondary';

  const { canDrop, isOver, dropTarget } = useFileDrop(onDrop);

  const isActive = canDrop && isOver;

  let boxMessage = 'No file selected';
  if (readOnly) {
    boxMessage = 'Attachment item is read only';
  } else if (isActive) {
    boxMessage = 'Release to drop file';
  } else if (errorMessage) {
    boxMessage = errorMessage;
  } else if (file) {
    boxMessage = file.name;
  }

  return (
    <AttachmentFileDropBoxWrapper
      ref={dropTarget as unknown as React.Ref<any>} // works in runtime, but produces error TS2322: Type 'ConnectDropTarget' is not assignable to type 'Ref<unknown> | undefined' at compile time
      display="flex"
      isActive={isActive}
      textFieldWidth={textFieldWidth}
      isTabled={isTabled}>
      <Box p={1.5}>
        <Typography component="div" color={readOnly ? readOnlyTextColor : 'text.primary'}>
          {boxMessage}
        </Typography>

        {file ? (
          <Box pt={1}>
            <Typography component="div" fontSize={10}>
              Size: {getFileSize(file.size.toString() ?? '0')}
            </Typography>
            <Typography component="div" fontSize={10}>
              Type: {file.type}
            </Typography>
          </Box>
        ) : null}
      </Box>
    </AttachmentFileDropBoxWrapper>
  );
}

export default AttachmentFileDropBox;
