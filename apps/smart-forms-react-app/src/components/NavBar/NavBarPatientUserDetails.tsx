import React from 'react';
import { Stack } from '@mui/material';
import { PatientData, UserData } from '../../interfaces/Interfaces';
import { NavBarPatientDetailsTypography, NavBarPatientUserDataBox } from './NavBar.styles';
import NavBarPatientDetails from './NavBarPatientDetails';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import NavBarPatientUserPopper from './NavBarPatientUserPopper';

export interface Props {
  patientData: PatientData;
  userData: UserData;
}

function NavBarPatientUserDetails(props: Props) {
  const { patientData, userData } = props;

  return (
    <>
      <NavBarPatientUserDataBox gap={2}>
        <NavBarPatientDetails patientData={patientData} />

        <Stack direction="row" alignItems="center" spacing={1}>
          <MedicalServicesIcon fontSize="small" />
          <NavBarPatientDetailsTypography>
            {userData.name === '' ? 'No User' : userData.name}
          </NavBarPatientDetailsTypography>
        </Stack>
      </NavBarPatientUserDataBox>

      {patientData.name !== '' ? (
        <NavBarPatientUserPopper patientData={patientData} userData={userData} />
      ) : null}
    </>
  );
}

export default NavBarPatientUserDetails;
