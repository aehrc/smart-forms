import { useEffect, useState } from 'react';
import DashboardHeader from './DashboardHeader/DashboardHeader';
import DashboardNav from './DashboardNav/DashboardNav';
import { Main, StyledRoot } from '../StyledComponents/Layout.styles';
import { Outlet, useNavigate } from 'react-router-dom';
import SelectedQuestionnaireContextProvider from '../../custom-contexts/SelectedQuestionnaireContext';

function DashboardLayout() {
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Get initial questionnaire and redirect to renderer
    const questionnaireUrl = sessionStorage.getItem('questionnaireUrl');
    if (questionnaireUrl) {
      navigate('/renderer');
      sessionStorage.removeItem('questionnaireUrl');
    }
  }, []); // redirect to renderer on first render, leave dependency array empty

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
