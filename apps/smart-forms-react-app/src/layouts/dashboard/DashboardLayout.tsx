import { useState } from 'react';
import DashboardHeader from './DashboardHeader';
import Nav from './nav/Nav';
import { Main, StyledRoot } from './DashboardLayout.styles';
import { Outlet } from 'react-router-dom';
import SelectedQuestionnaireContextProvider from '../../custom-contexts/SelectedQuestionnaireContext';

function DashboardLayout() {
  const [open, setOpen] = useState(false);

  return (
    <StyledRoot>
      <DashboardHeader onOpenNav={() => setOpen(true)} />
      <Nav openNav={open} onCloseNav={() => setOpen(false)} />

      <Main>
        <SelectedQuestionnaireContextProvider>
          <Outlet />
        </SelectedQuestionnaireContextProvider>
      </Main>
    </StyledRoot>
  );
}

export default DashboardLayout;
