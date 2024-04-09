/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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
import { useSnackbar } from 'notistack';
import ConfettiExplosion from 'react-confetti-explosion';
import useClickCounter from '../../features/easterEgg/hooks/useClickCounter.ts';
import useDebugMode from '../../hooks/useDebugMode.ts';

function CsiroLogo() {
  const { debugModeEnabled, toggleDebugMode } = useDebugMode();

  const { enqueueSnackbar } = useSnackbar();

  const { counter, addOneToCounter } = useClickCounter();

  return (
    <>
      <Box display="flex" justifyContent="center" alignItems="center" gap={1.5}>
        <Typography sx={{ color: 'text.secondary' }}>By</Typography>
        <Box
          component="img"
          maxHeight={35}
          maxWidth={35}
          src={csiroLogo}
          onClick={() => {
            if (!debugModeEnabled && counter < 3) {
              addOneToCounter();
              if (counter === 2) {
                toggleDebugMode();
                enqueueSnackbar('Debug mode enabled!', {
                  preventDuplicate: true
                });
              }
            }
          }}
        />
      </Box>
      {counter === 3 ? (
        <ConfettiExplosion particleCount={400} width={2000} duration={3000} />
      ) : null}
    </>
  );
}
export default CsiroLogo;
