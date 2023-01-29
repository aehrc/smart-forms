import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import React from 'react';

function NavBarGenderIcon(props: { gender: string }) {
  const { gender } = props;

  if (gender == 'male') {
    return <MaleIcon fontSize="small" />;
  } else if (gender == 'female') {
    return <FemaleIcon fontSize="small" />;
  } else {
    return (
      <>
        <MaleIcon fontSize="small" sx={{ mr: -0.5 }} />
        <FemaleIcon fontSize="small" />
      </>
    );
  }
}

export default NavBarGenderIcon;
