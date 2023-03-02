import React, { useContext, useEffect, useState } from 'react';
import { Fade, Typography } from '@mui/material';
import { RendererContext } from '../RendererLayout';

function UpdatingIndicator() {
  const { renderer } = useContext(RendererContext);

  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
    }, 500);
  }, [renderer]);

  return (
    <Fade in={isUpdating} timeout={100}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ px: 2 }}>
        Updating...
      </Typography>
    </Fade>
  );
}

export default UpdatingIndicator;
