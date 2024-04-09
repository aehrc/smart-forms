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

import type { ChangeEvent } from 'react';
import { memo, useCallback, useState } from 'react';
import DropBox from './DropBox.tsx';
import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import Iconify from '../../../components/Iconify/Iconify.tsx';
import { useSnackbar } from 'notistack';

interface FileCollectorProps {
  onBuild: (file: File) => unknown;
}

const FileCollector = memo(function FileCollector(props: FileCollectorProps) {
  const { onBuild } = props;
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const { enqueueSnackbar } = useSnackbar();

  const handleFileDrop = useCallback(
    (item: { files: any[] }) => {
      if (item) {
        const files = item.files;

        if (files.length > 1) {
          enqueueSnackbar('Only one file allowed', {
            variant: 'warning',
            preventDuplicate: true
          });
        }

        if (files[0] instanceof File) {
          const file = files[0];

          setUploadedFile(file);
        }
      }
    },
    [setUploadedFile, enqueueSnackbar]
  );

  function handleAttachFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file instanceof File) {
      setUploadedFile(file);
    }
  }

  function handleRemoveFile() {
    setUploadedFile(null);
  }

  return (
    <Box sx={{ py: 2 }}>
      <DropBox onDrop={handleFileDrop} file={uploadedFile} errorMessage={''} />
      <Stack direction="row" justifyContent="space-between" sx={{ py: 1 }}>
        <Box>
          <Tooltip title="Attach file">
            <IconButton component="label">
              <Iconify icon="fluent:attach-24-regular" />
              <input type="file" hidden onChange={handleAttachFile} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove file">
            <span>
              <IconButton disabled={!uploadedFile} color="error" onClick={handleRemoveFile}>
                <Iconify icon="ant-design:delete" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        <Tooltip title="Build Form">
          <span>
            <IconButton
              disabled={!uploadedFile}
              color="success"
              onClick={() => {
                if (uploadedFile) {
                  onBuild(uploadedFile);
                }
              }}>
              <Iconify icon="ph:hammer" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    </Box>
  );
});

export default FileCollector;
