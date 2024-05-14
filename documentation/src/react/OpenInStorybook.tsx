import React from 'react';
import Iconify from '@site/src/react/Iconify';
import { IconButton, Tooltip } from '@mui/material';

interface OpenInStorybookProps {
  storyUrl: string;
}

function OpenInStorybook(props: OpenInStorybookProps) {
  const { storyUrl } = props;

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <a href={storyUrl} target="_blank" rel="noreferrer">
        <Tooltip title="Open in Storybook">
          <IconButton size="small">
            <Iconify icon="material-symbols:open-in-new" />
          </IconButton>
        </Tooltip>
      </a>
    </div>
  );
}

export default OpenInStorybook;
