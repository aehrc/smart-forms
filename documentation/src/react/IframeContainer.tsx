import type { ReactNode } from 'react';
import React from 'react';
import Box from '@mui/material/Box';
import OpenInStorybook from '@site/src/react/OpenInStorybook';

interface OpenInStorybookProps {
  storyUrl: string;
  children: ReactNode;
}

function IframeContainer(props: OpenInStorybookProps) {
  const { storyUrl, children } = props;

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        width: '100%'
      }}>
      {children}
      <div style={{ position: 'absolute', top: '4px', right: '4px' }}>
        <OpenInStorybook storyUrl={storyUrl} />
      </div>
    </Box>
  );
}

export default IframeContainer;
