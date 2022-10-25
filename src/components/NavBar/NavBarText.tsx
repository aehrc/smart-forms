import React from 'react';
import { Stack } from '@mui/material';
import { NavBarIconTypography } from './NavBar.styles';

interface Props {
  icon: JSX.Element;
  text: string;
}

function NavBarText(props: Props) {
  const { icon, text } = props;

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      {icon}
      <NavBarIconTypography>{text}</NavBarIconTypography>
    </Stack>
  );
}

export default NavBarText;
