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

// @ts-ignore
import React from 'react';
import { CircularProgress, Fade, IconButton, Tooltip } from '@mui/material';
import Typography from '@mui/material/Typography';
import Iconify from '../../../components/Iconify/Iconify.tsx';

interface ExtractForPlaygroundProps {
  isExtracting: boolean;
  onExtract: () => void;
}

function ExtractButtonForPlayground(props: ExtractForPlaygroundProps) {
  const { isExtracting, onExtract } = props;

  return (
    <>
      <Tooltip title="Perform $extract" placement="bottom-end">
        <span>
          <IconButton
            disabled={isExtracting}
            onClick={onExtract}
            size="small"
            color="primary"
            data-test="extract-button-playground">
            {isExtracting ? (
              <CircularProgress size={20} color="inherit" sx={{ mb: 0.5 }} />
            ) : (
              <Iconify icon="tabler:transform" />
            )}
          </IconButton>
        </span>
      </Tooltip>
      {isExtracting ? (
        <Fade in={true} timeout={100}>
          <Typography variant="body2" color="text.secondary">
            Performing extraction...
          </Typography>
        </Fade>
      ) : null}
    </>
  );
}

export default ExtractButtonForPlayground;
