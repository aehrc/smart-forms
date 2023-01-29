import React from 'react';
import { Box, Skeleton } from '@mui/material';

function PickerSkeletonList() {
  return (
    <Box sx={{ mx: 2, my: 1 }}>
      {Array.from({ length: 10 }, (_, i) => (
        <Skeleton key={i} height={50} />
      ))}
    </Box>
  );
}

export default PickerSkeletonList;
