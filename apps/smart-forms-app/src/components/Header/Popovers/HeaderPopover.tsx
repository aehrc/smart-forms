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
import { Avatar, IconButton, Popover, Stack, Typography } from '@mui/material';
import type { ReactElement } from 'react';

interface HeaderPopoverProps {
  entity: string;
  bgColor: string;
  displayIcon: ReactElement;
  menuContent: ReactElement;
}

function HeaderPopover(props: HeaderPopoverProps) {
  const { entity, bgColor, displayIcon, menuContent } = props;

  return (
    <>
      <PopupState
        variant="popover"
        popupId="header-popover"
        disableAutoFocus={true}
        parentPopupState={null}>
        {(popupState) => (
          <div>
            <Stack alignItems="center" mt={0.5} ml={1.25}>
              <Avatar sx={{ bgcolor: bgColor, width: 34, height: 34 }}>
                <IconButton {...bindTrigger(popupState)}>{displayIcon}</IconButton>
              </Avatar>
              <Typography fontSize={9} variant="subtitle2">
                {entity}
              </Typography>
            </Stack>
            <Popover
              {...bindPopover(popupState)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
              {menuContent}
            </Popover>
          </div>
        )}
      </PopupState>
    </>
  );
}

export default HeaderPopover;
