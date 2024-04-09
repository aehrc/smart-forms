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

import PopupState, { bindPopover, bindTrigger } from 'material-ui-popup-state';
import { IconButton, Popover, Stack, Typography } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import { PopoverMenuWrapper } from './Popover.styles.ts';

function NotLaunchedPopover() {
  return (
    <>
      <PopupState
        variant="popover"
        popupId="header-popover"
        disableAutoFocus={true}
        parentPopupState={null}>
        {(popupState) => (
          <div>
            <Stack alignItems="center">
              <IconButton {...bindTrigger(popupState)}>
                <ErrorIcon fontSize="large" color="error" />
              </IconButton>
            </Stack>
            <Popover
              {...bindPopover(popupState)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 0.25
                  }
                }
              }}>
              <PopoverMenuWrapper>
                <Typography variant="subtitle1">
                  Saving is disabled, app not launched via SMART
                </Typography>
              </PopoverMenuWrapper>
            </Popover>
          </div>
        )}
      </PopupState>
    </>
  );
}

export default NotLaunchedPopover;
