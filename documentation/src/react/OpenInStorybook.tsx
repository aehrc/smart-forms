import React from 'react';
import { IconButton, Tooltip } from '@mui/material';

interface OpenInStorybookProps {
  storyUrl: string;
}

function OpenInStorybook(props: OpenInStorybookProps) {
  const { storyUrl } = props;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: '16px'
      }}>
      <a href={storyUrl} target="_blank" rel="noreferrer">
        <Tooltip title="Open in Storybook">
          <IconButton size="small">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2z"
              />
            </svg>
          </IconButton>
        </Tooltip>
      </a>
    </div>
  );
}

export default OpenInStorybook;
