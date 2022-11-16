import * as React from 'react';
import { Box } from '@mui/material';
import { ChipBarBox } from './ChipBar.styles';

function ChipBar(props: { children: any }) {
  const { children } = props;

  return (
    <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
      <ChipBarBox gap={1}>{children}</ChipBarBox>
    </Box>
  );
}

export default ChipBar;
