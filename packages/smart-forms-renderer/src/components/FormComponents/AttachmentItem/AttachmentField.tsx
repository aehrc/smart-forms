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
import type { PropsWithIsTabledAttribute } from '../../../interfaces/renderProps.interface';
import { StandardTextField } from '../Textfield.styles';
import AttachmentFileCollector from './AttachmentFileCollector';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { AttachmentValues } from './AttachmentItem';
import AttachmentUrlField from './AttachmentUrlField';

interface AttachmentFieldProps extends PropsWithIsTabledAttribute {
  linkId: string;
  attachmentValues: AttachmentValues;
  readOnly: boolean;
  onUploadFile: (file: File | null) => void;
  onUrlChange: (url: string) => void;
  onFileNameChange: (fileName: string) => void;
}

function AttachmentField(props: AttachmentFieldProps) {
  const {
    linkId,
    attachmentValues,
    readOnly,
    isTabled,
    onUploadFile,
    onUrlChange,
    onFileNameChange
  } = props;

  const { uploadedFile, url, fileName } = attachmentValues;

  return (
    <>
      <Stack rowGap={1}>
        <Typography variant="subtitle2" color={readOnly ? 'text.disabled' : 'text.primary'}>
          An attachment must either have a file or a URL, or both.
        </Typography>
        <Box>
          <AttachmentFileCollector
            uploadedFile={uploadedFile}
            readOnly={readOnly}
            isTabled={isTabled}
            onUploadFile={onUploadFile}
          />
        </Box>

        <AttachmentUrlField
          linkId={linkId}
          url={url}
          readOnly={readOnly}
          isTabled={isTabled}
          onUrlChange={onUrlChange}
        />

        <Box>
          <Typography variant="body2" color={readOnly ? 'text.disabled' : 'text.primary'}>
            File name (optional)
          </Typography>
          <StandardTextField
            fullWidth
            isTabled={isTabled}
            id={linkId}
            value={fileName}
            onChange={(event) => onFileNameChange(event.target.value)}
            disabled={readOnly}
            size="small"
            data-test="q-item-attachment-field"
          />
        </Box>

        {uploadedFile && url ? (
          <Typography variant="subtitle2" color={readOnly ? 'text.disabled' : 'text.primary'}>
            Ensure that the attached file and URL has the same content.
          </Typography>
        ) : null}
      </Stack>
    </>
  );
}

export default AttachmentField;
