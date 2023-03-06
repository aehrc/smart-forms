import { Box, Typography } from '@mui/material';
import csiroLogo from '../../data/images/csiro-logo.png';
import React, { useContext, useEffect, useState } from 'react';
import { DebugModeContext } from '../../Router';
import { useSnackbar } from 'notistack';
import ConfettiExplosion from 'react-confetti-explosion';

function CsiroLogo() {
  const { debugMode, activateDebugMode } = useContext(DebugModeContext);

  const [clickCounter, setClickCounter] = useState(0);

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (clickCounter === 7) {
      setTimeout(() => {
        setClickCounter(0);
      }, 2500);
    }
  }, [clickCounter]);

  return (
    <>
      <Box display="flex" justifyContent="center" alignItems="center" gap={1.5}>
        <Typography sx={{ color: 'text.secondary' }}>By</Typography>
        <Box
          component="img"
          sx={{
            maxHeight: { xs: 35 },
            maxWidth: { xs: 35 }
          }}
          src={csiroLogo}
          onClick={() => {
            if (!debugMode && clickCounter < 8) {
              if (clickCounter === 7) {
                activateDebugMode();
                enqueueSnackbar('Debug mode enabled!', {
                  preventDuplicate: true
                });
              } else if (clickCounter < 7) {
                setClickCounter(clickCounter + 1);
              }
            }
          }}
        />
      </Box>
      {clickCounter === 7 ? (
        <ConfettiExplosion particleCount={400} width={2000} duration={3000} />
      ) : null}
    </>
  );
}
export default CsiroLogo;
