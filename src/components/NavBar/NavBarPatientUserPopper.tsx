import * as React from 'react';
import PopupState, { bindPopover, bindTrigger } from 'material-ui-popup-state';
import {
  NavBarPatientUserDataIconButton,
  NavBarPopUpBox,
  PatientDetailsDialogTypography
} from './NavBar.styles';
import { List, ListItem, Popover, Stack } from '@mui/material';
import NavBarGenderIcon from './NavBarGenderIcon';
import { AccountCircle, Event, MedicalServices } from '@mui/icons-material/';
import { PatientData, UserData } from '../../interfaces/Interfaces';

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
            <NavBarPatientUserDataIconButton {...bindTrigger(popupState)}>
              <AccountCircle />
            </NavBarPatientUserDataIconButton>
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
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <AccountCircle />
                      <PatientDetailsDialogTypography>
                        {patientData.name}
                      </PatientDetailsDialogTypography>
                    </Stack>
                  </ListItem>
                  <ListItem>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <NavBarGenderIcon gender={patientData.gender} />
                      <PatientDetailsDialogTypography>
                        {patientData.gender}
                      </PatientDetailsDialogTypography>
                    </Stack>
                  </ListItem>
                  <ListItem>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Event />
                      <PatientDetailsDialogTypography>
                        {patientData.dateOfBirth}
                      </PatientDetailsDialogTypography>
                    </Stack>
                  </ListItem>
                  <ListItem>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <MedicalServices />
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
