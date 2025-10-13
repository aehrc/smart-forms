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

import type { ChangeEvent } from 'react';
import React, { memo, useCallback } from 'react';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import AttachmentFileDropBox from './AttachmentFileDropBox';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import type { PropsWithIsTabledAttribute } from '../../../interfaces/renderProps.interface';

interface AttachmentFileCollectorProps extends PropsWithIsTabledAttribute {
  uploadedFile: File | null;
  readOnly: boolean;
  onUploadFile: (file: File | null) => void;
}

const AttachmentFileCollector = memo(function AttachmentFileCollector(
  props: AttachmentFileCollectorProps
) {
  const { uploadedFile, readOnly, isTabled, onUploadFile } = props;

  const handleFileDrop = useCallback(
    (item: { files: any[] }) => {
      if (readOnly) {
        return;
      }

      if (item) {
        const files = item.files;

        if (files[0] instanceof File) {
          const file = files[0];

          onUploadFile(file);
        }
      }
    },
    [onUploadFile, readOnly]
  );

  function handleAttachFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file instanceof File) {
      onUploadFile(file);
    }
  }

  return (
    <>
      <AttachmentFileDropBox
        onDrop={handleFileDrop}
        file={uploadedFile}
        errorMessage={''}
        readOnly={readOnly}
        isTabled={isTabled}
      />
      <Stack direction="row" justifyContent="space-between" pt={0.5}>
        <Box>
          <Tooltip title="Attach file">
            <IconButton component="label" size="small" disabled={readOnly}>
              <AttachFileIcon fontSize="small" />
              <input type="file" hidden onChange={handleAttachFile} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove file">
            <span>
              <IconButton
                disabled={!uploadedFile || readOnly}
                color="error"
                size="small"
                onClick={() => onUploadFile(null)}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Stack>
    </>
  );
});

export default AttachmentFileCollector;
