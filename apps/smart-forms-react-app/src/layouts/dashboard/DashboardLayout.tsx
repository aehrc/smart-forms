import { useState } from 'react';
// @mui
//
import Header from './header/Header';
import Nav from './nav/Nav';
import { Main, StyledRoot } from './DashboardLayout.styles';
import { Outlet } from 'react-router-dom';

function DashboardLayout() {
  const [open, setOpen] = useState(false);

  return (
    <StyledRoot>
      <Header onOpenNav={() => setOpen(true)} />
      <Nav
        patientName={'Patient'}
        patientGender={'Male'}
        patientDOB={'20 Jan 2000'}
        openNav={open}
        onCloseNav={() => setOpen(false)}
      />

      <Main>
        <Outlet />
      </Main>
    </StyledRoot>
  );
}

export default DashboardLayout;
