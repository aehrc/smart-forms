import React, { useState } from 'react';
import Box from '@mui/material/Box';
import OpenInStorybook from '@site/src/react/OpenInStorybook';
import IframeResizer from '@iframe-resizer/react';

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
        marginBottom: '16px'
      }}>
      <div>
        <IframeResizer
          license="GPLv3" // GPLv3 license required for open-source projects https://iframe-resizer.com/frameworks/react/
          style={{
            width: '100%',
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
