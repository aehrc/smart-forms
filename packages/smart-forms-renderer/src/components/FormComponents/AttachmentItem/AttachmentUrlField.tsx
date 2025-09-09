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
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import useAttachmentUrlValidation from '../../../hooks/useAttachmentUrlValidation';
import InputAdornment from '@mui/material/InputAdornment';
import CheckIcon from '@mui/icons-material/Check';
import DangerousIcon from '@mui/icons-material/Dangerous';
import { useRendererStylingStore } from '../../../stores';
import { ClearButtonAdornment } from '../ItemParts/ClearButtonAdornment';

interface AttachmentUrlFieldProps extends PropsWithIsTabledRequiredAttribute {
  linkId: string;
  url: string;
  readOnly: boolean;
  onUrlChange: (url: string) => void;
}

function AttachmentUrlField(props: AttachmentUrlFieldProps) {
  const { linkId, url, readOnly, isTabled, onUrlChange } = props;

  const readOnlyVisualStyle = useRendererStylingStore.use.readOnlyVisualStyle();
  const textFieldWidth = useRendererStylingStore.use.textFieldWidth();

  const urlIsValid = useAttachmentUrlValidation(url);

  return (
    <Box>
      <Typography
        component="div"
        variant="body2"
        color={readOnly ? 'text.secondary' : 'text.primary'}>
        URL
      </Typography>
      <Stack direction="row" alignItems="center">
        <StandardTextField
          multiline
          fullWidth
          textFieldWidth={textFieldWidth}
          isTabled={isTabled}
          id={linkId}
          value={url}
          onChange={(event) => onUrlChange(event.target.value)}
          disabled={readOnly && readOnlyVisualStyle === 'disabled'}
          size="small"
          data-test="q-item-attachment-field"
          slotProps={{
            input: {
              readOnly: readOnly && readOnlyVisualStyle === 'readonly',
              endAdornment: (
                <InputAdornment position="end">
                  {url != '' ? (
                    <Box sx={{ pt: 0.75 }} title={urlIsValid ? 'URL is valid!' : 'Invalid URL'}>
                      {urlIsValid ? (
                        <CheckIcon color="success" fontSize="small" />
                      ) : (
                        <DangerousIcon color="error" fontSize="small" />
                      )}
                    </Box>
                  ) : null}
                  <ClearButtonAdornment
                    readOnly={readOnly}
                    onClear={() => {
                      onUrlChange('');
                    }}
                  />
                </InputAdornment>
              )
            },
            htmlInput: {
              'data-test': 'q-item-attachment-url',
              'aria-label': 'URL'
            }
          }}
        />
      </Stack>
    </Box>
  );
}

export default AttachmentUrlField;
