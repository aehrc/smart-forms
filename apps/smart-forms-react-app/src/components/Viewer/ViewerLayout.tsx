import React, { createContext, MutableRefObject, useState } from 'react';
import { Main, StyledRoot } from '../StyledComponents/Layout.styles';
import { Outlet } from 'react-router-dom';
import BackToTopButton from '../OperationButtons/BackToTopButton';
import { Fab } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ViewerHeader from './ViewerHeader';
import ViewerNav from './ViewerNav/ViewerNav';
import { PrintComponentRefContextType } from '../../interfaces/ContextTypes';

export const PrintComponentRefContext = createContext<PrintComponentRefContextType>({
  componentRef: null,
  setComponentRef: () => void 0
});

function ViewerLayout() {
  const [open, setOpen] = useState(false);

  const [componentRef, setComponentRef] = useState<MutableRefObject<null> | null>(null);

  return (
    <PrintComponentRefContext.Provider value={{ componentRef, setComponentRef }}>
      <StyledRoot>
        <ViewerHeader onOpenNav={() => setOpen(true)} />
        <ViewerNav openNav={open} onCloseNav={() => setOpen(false)} />

        <Main>
          <Outlet />
        </Main>
        <BackToTopButton>
          <Fab size="medium" sx={{ backgroundColor: 'pale.primary' }}>
            <KeyboardArrowUpIcon />
          </Fab>
        </BackToTopButton>
      </StyledRoot>
    </PrintComponentRefContext.Provider>
  );
}

export default ViewerLayout;
