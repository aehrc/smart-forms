import React, { useState } from 'react';
import { SideBarContextType } from '../interfaces/ContextTypes';

export const SideBarContext = React.createContext<SideBarContextType>({
  isExpanded: true,
  setIsExpanded: () => void 0
});

function SideBarContextProvider(props: { children: React.ReactNode }) {
  const { children } = props;
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const sideBarContext: SideBarContextType = {
    isExpanded,
    setIsExpanded
  };
  return <SideBarContext.Provider value={sideBarContext}>{children}</SideBarContext.Provider>;
}

export default SideBarContextProvider;
