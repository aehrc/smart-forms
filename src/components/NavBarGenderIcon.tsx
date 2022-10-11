import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import React from 'react';

function NavBarGenderIcon(props: { gender: string }) {
  const { gender } = props;

  if (gender == 'male') {
    return <MaleIcon />;
  } else if (gender == 'female') {
    return <FemaleIcon />;
  } else {
    return (
      <>
        <MaleIcon sx={{ mr: -0.5 }} />
        <FemaleIcon />
      </>
    );
  }
}

export default NavBarGenderIcon;
