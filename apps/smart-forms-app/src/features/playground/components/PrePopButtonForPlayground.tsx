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
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import Typography from '@mui/material/Typography';

interface PrePopButtonForPlaygroundProps {
  prePopEnabled: boolean;
  isPopulating: boolean;
  onPopulate: () => void;
}

function PrePopButtonForPlayground(props: PrePopButtonForPlaygroundProps) {
  const { prePopEnabled, isPopulating, onPopulate } = props;

  const toolTipText = prePopEnabled
    ? 'Pre-populate form'
    : 'Please select a patient in the Launch Context settings (located on the top right) to enable pre-population';

  return (
    <>
      <Tooltip title={toolTipText} placement="bottom-end">
        <span>
          <IconButton
            disabled={isPopulating || !prePopEnabled}
            onClick={onPopulate}
            size="small"
            color="primary"
            data-test="prepop-button-playground">
            {isPopulating ? (
              <CircularProgress size={20} color="inherit" sx={{ mb: 0.5 }} />
            ) : (
              <CloudDownloadIcon />
            )}
          </IconButton>
        </span>
      </Tooltip>
      {isPopulating ? (
        <Fade in={true} timeout={100}>
          <Typography variant="body2" color="text.secondary">
            Pre-populating form...
          </Typography>
        </Fade>
      ) : null}
    </>
  );
}

export default PrePopButtonForPlayground;
