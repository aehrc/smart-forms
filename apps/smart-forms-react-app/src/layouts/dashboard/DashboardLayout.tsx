import { createContext, useContext, useState } from 'react';
// @mui
//
import Header from './header/Header';
import Nav from './nav/Nav';
import { Main, StyledRoot } from './DashboardLayout.styles';
import { Outlet } from 'react-router-dom';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import { SourceContextType } from '../../interfaces/ContextTypes';
import SelectedQuestionnaireContextProvider from '../../custom-contexts/SelectedQuestionnaireContext';

export const SourceContext = createContext<SourceContextType>({
  source: 'local',
  setSource: () => void 0
});

function DashboardLayout() {
  const { fhirClient } = useContext(LaunchContext);
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<'local' | 'remote'>(fhirClient ? 'remote' : 'local');

  return (
    <StyledRoot>
      <Header onOpenNav={() => setOpen(true)} />
      <Nav openNav={open} onCloseNav={() => setOpen(false)} />

      <Main>
        <SourceContext.Provider value={{ source, setSource }}>
          <SelectedQuestionnaireContextProvider>
            <Outlet />
          </SelectedQuestionnaireContextProvider>
        </SourceContext.Provider>
      </Main>
    </StyledRoot>
  );
}

export default DashboardLayout;
