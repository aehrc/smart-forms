/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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

import { Box, Typography } from '@mui/material';
import csiroLogo from '../../data/images/csiro-logo.png';
import React, { useContext, useEffect, useState } from 'react';
import { DebugModeContext } from '../../custom-contexts/DebugModeContext';
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
