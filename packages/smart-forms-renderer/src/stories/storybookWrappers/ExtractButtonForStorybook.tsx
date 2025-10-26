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

// @ts-ignore
import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface ExtractButtonForStorybookProps {
  extractMode: 'observation' | 'template';
  onObservationExtract: () => void;
  onTemplateExtract: (modifiedOnly: boolean) => void;
}

function ExtractButtonForStorybook(props: ExtractButtonForStorybookProps) {
  const { extractMode, onObservationExtract, onTemplateExtract } = props;

  function onExtract() {
    if (extractMode === 'template') {
      onTemplateExtract(false);
      return;
    }

    if (extractMode === 'observation') {
      onObservationExtract();
    }
  }

  const tooltipText =
    extractMode === 'template' ? 'Template-based extract' : 'Observation-based extract';

  return (
    <>
      <Tooltip title={tooltipText}>
        <span>
          <IconButton onClick={onExtract} size="small" color="primary">
            <CloudUploadIcon />
          </IconButton>
        </span>
      </Tooltip>
    </>
  );
}

export default ExtractButtonForStorybook;
