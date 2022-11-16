import React from 'react';
import { Box, Skeleton } from '@mui/material';

function PickerSkeletonList() {
  return (
    <Box sx={{ mx: 2, my: 1 }}>
      <Skeleton height={50} />
      <Skeleton height={50} width={300} />
      <Skeleton height={50} width={200} />
      <Skeleton height={50} />
      <Skeleton height={50} width={350} />
      <Skeleton height={50} />
      <Skeleton height={50} width={300} />
      <Skeleton height={50} width={250} />
      <Skeleton height={50} width={350} />
      <Skeleton height={50} />
      <Skeleton height={50} width={150} />
    </Box>
  );
}

export default PickerSkeletonList;
