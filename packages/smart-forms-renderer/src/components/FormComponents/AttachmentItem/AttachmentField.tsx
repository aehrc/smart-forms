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

import React from 'react';
import type { PropsWithIsTabledRequiredAttribute } from '../../../interfaces/renderProps.interface';
import { StandardTextField } from '../Textfield.styles';
import AttachmentFileCollector from './AttachmentFileCollector';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { AttachmentValues } from './AttachmentItem';
import AttachmentUrlField from './AttachmentUrlField';
import { useRendererStylingStore } from '../../../stores';
import { StyledRequiredTypography } from '../Item.styles';
import InputAdornment from '@mui/material/InputAdornment';
import { ClearButtonAdornment } from '../ItemParts/ClearButtonAdornment';

interface AttachmentFieldProps extends PropsWithIsTabledRequiredAttribute {
  linkId: string;
  itemType: string;
  attachmentValues: AttachmentValues;
  feedback: string;
  readOnly: boolean;
  onUploadFile: (file: File | null) => void;
  onUrlChange: (url: string) => void;
  onFileNameChange: (fileName: string) => void;
}

function AttachmentField(props: AttachmentFieldProps) {
  const {
    linkId,
    itemType,
    attachmentValues,
    feedback,
    readOnly,
    isTabled,
    onUploadFile,
    onUrlChange,
    onFileNameChange
  } = props;

  const readOnlyVisualStyle = useRendererStylingStore.use.readOnlyVisualStyle();
  const textFieldWidth = useRendererStylingStore.use.textFieldWidth();

  const readOnlyTextColor = readOnlyVisualStyle === 'disabled' ? 'text.disabled' : 'text.secondary';

  const { uploadedFile, url, fileName } = attachmentValues;

  // TODO: Consider accessible items for attachment fields too if #1096 is fixed.

  return (
    <>
      <Stack rowGap={1} id={itemType + '-' + linkId}>
        <Typography component="div" color={readOnly ? readOnlyTextColor : 'text.primary'}>
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
          <Typography
            component="div"
            variant="body2"
            color={readOnly ? readOnlyTextColor : 'text.primary'}>
            File name (optional)
          </Typography>
          <StandardTextField
            multiline
            fullWidth
            textFieldWidth={textFieldWidth}
            isTabled={isTabled}
            id={linkId}
            value={fileName}
            onChange={(event) => onFileNameChange(event.target.value)}
            disabled={readOnly && readOnlyVisualStyle === 'disabled'}
            size="small"
            data-test="q-item-attachment-field"
            slotProps={{
              input: {
                readOnly: readOnly && readOnlyVisualStyle === 'readonly',
                endAdornment: (
                  <InputAdornment position="end">
                    <ClearButtonAdornment
                      readOnly={readOnly}
                      onClear={() => {
                        onFileNameChange('');
                      }}
                    />
                  </InputAdornment>
                )
              },
              htmlInput: {
                'data-test': 'q-item-attachment-file-name',
                'aria-label': 'File name (optional)'
              }
            }}
          />
        </Box>

        {uploadedFile && url ? (
          <Typography component="div" color={readOnly ? readOnlyTextColor : 'text.primary'}>
            Ensure that the attached file and URL has the same content.
          </Typography>
        ) : null}
      </Stack>

      {feedback ? <StyledRequiredTypography>{feedback}</StyledRequiredTypography> : null}
    </>
  );
}

export default AttachmentField;
