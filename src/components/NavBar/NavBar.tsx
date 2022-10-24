import React, { useContext } from 'react';
import dayjs from 'dayjs';
import { AppBar, Box, Toolbar, Stack, Typography } from '@mui/material';
import { PatientData, UserData } from '../../interfaces/Interfaces';
import NavBarPatientData from './NavBarPatientData';
import { Questionnaire } from 'fhir/r5';
import NavBarUserData from './NavBarUserData';
import { constructName } from '../../functions/LaunchContextFunctions';
import { LaunchContextType } from '../../interfaces/ContextTypes';
import { QuestionnaireActiveContext } from '../../custom-contexts/QuestionnaireActiveContext';

interface Props {
  questionnaire: Questionnaire;
  launchContext: LaunchContextType;
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
  const { questionnaire, launchContext } = props;
  const questionnaireActive = useContext(QuestionnaireActiveContext);

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
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar variant="dense">
          <Box>
            <Typography>
              {questionnaireActive.questionnaireActive
                ? questionnaire.title
                : 'SMART Health Checks'}
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }}></Box>
          <Stack direction="row" spacing={3}>
            <Box>
              <NavBarPatientData patientData={patientData} />
            </Box>
            <Box>
              <NavBarUserData userData={userData} />
            </Box>
          </Stack>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default React.memo(NavBar);
