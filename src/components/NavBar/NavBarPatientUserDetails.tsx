import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  Stack,
  Typography
} from '@mui/material';
import React from 'react';
import { PatientData, UserData } from '../../interfaces/Interfaces';
import {
  NavBarPatientUserDataBox,
  NavBarPatientUserDataIconButton,
  PatientDetailsDialogTypography
} from './NavBar.styles';
import NavBarPatientDetails from './NavBarPatientDetails';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NavBarGenderIcon from './NavBarGenderIcon';
import EventIcon from '@mui/icons-material/Event';

export interface Props {
  patientData: PatientData;
  userData: UserData;
}

function NavBarPatientUserDetails(props: Props) {
  const { patientData, userData } = props;

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  function handleClose() {
    setOpen(false);
  }

  return (
    <>
      <NavBarPatientUserDataBox gap={2}>
        <NavBarPatientDetails patientData={patientData} />

        <Stack direction="row" alignItems="center" spacing={2}>
          <MedicalServicesIcon />
          <Typography textTransform="capitalize">
            {userData.name === '' ? 'No User' : userData.name}
          </Typography>
        </Stack>
      </NavBarPatientUserDataBox>

      <NavBarPatientUserDataIconButton onClick={handleClickOpen}>
        <AccountCircleIcon />
      </NavBarPatientUserDataIconButton>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Patient and user details</DialogTitle>
        <DialogContent>
          <List>
            <ListItem>
              <Stack direction="row" alignItems="center" spacing={2}>
                <AccountCircleIcon />
                <PatientDetailsDialogTypography>{patientData.name}</PatientDetailsDialogTypography>
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
                <EventIcon />
                <PatientDetailsDialogTypography>
                  {patientData.dateOfBirth}
                </PatientDetailsDialogTypography>
              </Stack>
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Back to form</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default NavBarPatientUserDetails;
