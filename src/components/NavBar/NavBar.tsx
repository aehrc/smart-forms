import React, { useContext } from 'react';
import dayjs from 'dayjs';
import { Box } from '@mui/material';
import { PatientData, UserData } from '../../interfaces/Interfaces';
import NavBarPatientData from './NavBarPatientData';
import { Questionnaire } from 'fhir/r5';
import NavBarUserData from './NavBarUserData';
import { constructName } from '../../functions/LaunchContextFunctions';
import { QuestionnaireActiveContext } from '../../custom-contexts/QuestionnaireActiveContext';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import MenuIcon from '@mui/icons-material/Menu';
import {
  NavAppBar,
  NavBarContextDetailsBox,
  NavBarDrawerIconButton,
  NavBarFillerBox,
  NavBarTitleBox,
  NavBarTitleTypography,
  NavToolBar
} from './NavBar.styles';

interface Props {
  questionnaire: Questionnaire;
  handleDrawerToggle: () => unknown;
  drawerWidth?: number;
}

const patientData: PatientData = {
  name: '',
  gender: '',
  dateOfBirth: ''
};

const userData: UserData = {
  name: ''
};

function NavBar(props: Props) {
  const { questionnaire, handleDrawerToggle, drawerWidth } = props;
  const questionnaireActive = useContext(QuestionnaireActiveContext);
  const launchContext = useContext(LaunchContext);

  const patient = launchContext.patient;
  const user = launchContext.user;

  if (patient) {
    const dateOfBirthDayJs = dayjs(patient.birthDate);
    const age = dayjs().diff(dateOfBirthDayJs, 'year');

    patientData.name = constructName(patient.name);
    patientData.gender = `${patient.gender}`;
    patientData.dateOfBirth = `${dateOfBirthDayJs.format('LL')} (${age} years)`;
  }

  if (user) {
    userData.name = constructName(user.name);
  }

  return (
    <>
      <NavAppBar drawerWidth={drawerWidth}>
        <NavToolBar variant="dense">
          {drawerWidth ? (
            <NavBarDrawerIconButton onClick={handleDrawerToggle}>
              <MenuIcon />
            </NavBarDrawerIconButton>
          ) : null}

          <NavBarTitleBox>
            <NavBarTitleTypography>
              {questionnaireActive.questionnaireActive
                ? questionnaire.title
                : 'SMART Health Checks'}
            </NavBarTitleTypography>
          </NavBarTitleBox>
          <Box sx={{ flexGrow: 1 }} />
          <NavBarContextDetailsBox gap={2}>
            <NavBarPatientData patientData={patientData} />
            <NavBarUserData userData={userData} />
          </NavBarContextDetailsBox>
        </NavToolBar>
      </NavAppBar>
      <NavBarFillerBox drawerWidth={drawerWidth} />
    </>
  );
}

export default React.memo(NavBar);
