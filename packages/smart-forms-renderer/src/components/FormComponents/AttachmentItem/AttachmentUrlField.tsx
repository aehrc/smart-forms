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
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import useAttachmentUrlValidation from '../../../hooks/useAttachmentUrlValidation';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import CheckIcon from '@mui/icons-material/Check';
import DangerousIcon from '@mui/icons-material/Dangerous';

interface AttachmentUrlFieldProps extends PropsWithIsTabledAttribute {
  linkId: string;
  url: string;
  readOnly: boolean;
  onUrlChange: (url: string) => void;
}

function AttachmentUrlField(props: AttachmentUrlFieldProps) {
  const { linkId, url, readOnly, isTabled, onUrlChange } = props;

  const urlIsValid = useAttachmentUrlValidation(url);

  return (
    <Box>
      <Typography variant="body2">URL</Typography>
      <Stack direction="row" alignItems="center">
        <StandardTextField
          fullWidth
          isTabled={isTabled}
          id={linkId}
          value={url}
          onChange={(event) => onUrlChange(event.target.value)}
          disabled={readOnly}
          size="small"
          data-test="q-item-attachment-field"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {url != '' ? (
                  <Tooltip title={urlIsValid ? 'URL is valid!' : 'Invalid URL'} placement="right">
                    <Box mt={0.5}>
                      {urlIsValid ? (
                        <CheckIcon color="success" fontSize="small" />
                      ) : (
                        <DangerousIcon color="error" fontSize="small" />
                      )}
                    </Box>
                  </Tooltip>
                ) : null}
              </InputAdornment>
            )
          }}
        />
      </Stack>
    </Box>
  );
}

export default AttachmentUrlField;
