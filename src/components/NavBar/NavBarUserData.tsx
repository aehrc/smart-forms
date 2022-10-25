import React from 'react';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { UserData } from '../../interfaces/Interfaces';
import NavBarText from './NavBarText';

interface Props {
  userData: UserData;
}

function NavBarUserData(props: Props) {
  const { userData } = props;

  return (
    <NavBarText
      icon={<MedicalServicesIcon />}
      text={userData.name === '' ? 'No User' : userData.name}
    />
  );
}

export default NavBarUserData;
