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
import {
  NavBarPatientUserDataIconButton,
  NavBarPopUpBox,
  PatientDetailsDialogTypography
} from './NavBar.styles';
import { List, ListItem, Popover, Stack, Tooltip } from '@mui/material';
import NavBarGenderIcon from './NavBarGenderIcon';
import { PatientData, UserData } from '../../interfaces/Interfaces';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EventIcon from '@mui/icons-material/Event';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

interface Props {
  patientData: PatientData;
  userData: UserData;
}

function NavBarPatientUserPopper(props: Props) {
  const { patientData, userData } = props;

  return (
    <>
      <PopupState variant="popover" popupId="patient-details-popover">
        {(popupState) => (
          <div>
            <Tooltip title="View patient and user details">
              <NavBarPatientUserDataIconButton {...bindTrigger(popupState)}>
                <AccountCircleIcon fontSize="small" />
              </NavBarPatientUserDataIconButton>
            </Tooltip>
            <Popover
              {...bindPopover(popupState)}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center'
              }}>
              <NavBarPopUpBox>
                <List>
                  <ListItem>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <AccountCircleIcon fontSize="small" />
                      <PatientDetailsDialogTypography>
                        {patientData.name}
                      </PatientDetailsDialogTypography>
                    </Stack>
                  </ListItem>
                  <ListItem>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <NavBarGenderIcon gender={patientData.gender} />
                      <PatientDetailsDialogTypography>
                        {patientData.gender}
                      </PatientDetailsDialogTypography>
                    </Stack>
                  </ListItem>
                  <ListItem>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <EventIcon fontSize="small" />
                      <PatientDetailsDialogTypography>
                        {patientData.dateOfBirth}
                      </PatientDetailsDialogTypography>
                    </Stack>
                  </ListItem>
                  <ListItem>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <MedicalServicesIcon fontSize="small" />
                      <PatientDetailsDialogTypography>
                        {userData.name}
                      </PatientDetailsDialogTypography>
                    </Stack>
                  </ListItem>
                </List>
              </NavBarPopUpBox>
            </Popover>
          </div>
        )}
      </PopupState>
    </>
  );
}

export default NavBarPatientUserPopper;
