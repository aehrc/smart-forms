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

import React from 'react';
import PopupState, { bindPopover, bindTrigger } from 'material-ui-popup-state';
import { Box, IconButton, Popover, Typography } from '@mui/material';

interface Props {
  patientName: string;
  displayIcon: JSX.Element;
  patientGender?: string;
  patientAge?: string;
  patientDOB?: string;
}

function AccountPopover(props: Props) {
  const { patientName, patientGender, patientAge, patientDOB, displayIcon } = props;

  return (
    <>
      <PopupState variant="popover" popupId="patient-details-popover">
        {(popupState) => (
          <div>
            <IconButton {...bindTrigger(popupState)}>{displayIcon}</IconButton>
            <Popover
              {...bindPopover(popupState)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: {
                  p: 0,
                  mt: 1.5,
                  ml: 0.75,
                  width: 180,
                  '& .MuiMenuItem-root': {
                    typography: 'body2',
                    borderRadius: 0.75
                  }
                }
              }}>
              <Box sx={{ my: 1.5, px: 2.5 }}>
                <Typography variant="subtitle2" noWrap>
                  {patientName}
                </Typography>
                {patientGender ? (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                    {patientGender}
                  </Typography>
                ) : null}
                {patientAge ? (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                    {patientAge}
                  </Typography>
                ) : null}
                {patientDOB ? (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                    {patientDOB}
                  </Typography>
                ) : null}
              </Box>
            </Popover>
          </div>
        )}
      </PopupState>
    </>
  );
}

export default AccountPopover;
