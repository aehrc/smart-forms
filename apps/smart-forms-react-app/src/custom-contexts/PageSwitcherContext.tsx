import * as React from 'react';
import { PageType } from '../interfaces/Enums';
import { PageSwitcherContextType } from '../interfaces/ContextTypes';

export const PageSwitcherContext = React.createContext<PageSwitcherContextType>({
  currentPage: PageType.Renderer,
  goToPage: () => void 0
});

function PageSwitcherContextProvider(props: { children: React.ReactNode }) {
  const { children } = props;
  const [currentPage, goToPage] = React.useState<PageType>(PageType.Renderer);

  const pageSwitcherContext: PageSwitcherContextType = {
    currentPage: currentPage,
    goToPage: goToPage
  };
  return (
    <PageSwitcherContext.Provider value={pageSwitcherContext}>
      {children}
    </PageSwitcherContext.Provider>
  );
}

export default PageSwitcherContextProvider;
