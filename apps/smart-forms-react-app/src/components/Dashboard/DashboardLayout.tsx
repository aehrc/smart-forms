import { useState } from 'react';
import DashboardHeader from './DashboardHeader/DashboardHeader';
import DashboardNav from './DashboardNav/DashboardNav';
import { Main, StyledRoot } from '../StyledComponents/Layout.styles';
import { Outlet } from 'react-router-dom';
import SelectedQuestionnaireContextProvider from '../../custom-contexts/SelectedQuestionnaireContext';

function DashboardLayout() {
  const [open, setOpen] = useState(false);

  return (
    <StyledRoot>
      <DashboardHeader onOpenNav={() => setOpen(true)} />
      <DashboardNav openNav={open} onCloseNav={() => setOpen(false)} />

      <Main>
        <SelectedQuestionnaireContextProvider>
          <Outlet />
        </SelectedQuestionnaireContextProvider>
      </Main>
    </StyledRoot>
  );
}

export default DashboardLayout;
