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

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import OpenInStorybook from '@site/src/react/OpenInStorybook';
import IframeResizer from './IframeResizer';

interface OpenInStorybookProps {
  storyId: string;
  initialHeight: number;
}

function IframeContainer(props: OpenInStorybookProps) {
  const { storyId, initialHeight } = props;

  const baseUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:6006'
      : 'https://smartforms.csiro.au/storybook';

  const storyUrl = baseUrl + '/index.html?path=/story/' + storyId;
  const iframeUrl = baseUrl + '/iframe.html?args=&id=' + storyId;

  const [actualHeight, setActualHeight] = useState<number | null>(null);

  const initialHeightInRem = initialHeight / 16;

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        width: '100%',
        border: '1px solid #E4E4E7',
        borderRadius: '0.5rem',
        marginBottom: '16px',
        backgroundColor: '#FFF'
      }}>
      <div>
        <IframeResizer
          style={{
            width: '100%',
            minWidth: '100%',
            height: `${initialHeightInRem}rem`,
            minHeight: `${initialHeightInRem}rem`,
            borderRadius: '0.5rem',
            padding: '0 4px'
          }}
          onResized={(data) => {
            setActualHeight(data.height);
          }}
          src={iframeUrl}
        />
        <div style={{ position: 'absolute', top: '4px', right: '4px' }}>
          <OpenInStorybook storyUrl={storyUrl} />
        </div>

        {process.env.NODE_ENV === 'development' ? (
          <div
            style={{
              position: 'absolute',
              bottom: '4px',
              right: '8px',
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
            Initial height: {initialHeight}px | Actual height:{' '}
            {actualHeight ? actualHeight + 'px' : 'N/A'}
          </div>
        ) : null}
      </div>
    </Box>
  );
}

export default IframeContainer;
