import * as React from 'react';
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
