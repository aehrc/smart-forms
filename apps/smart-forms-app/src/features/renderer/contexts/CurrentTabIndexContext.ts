import { createContext } from 'react';

export type CurrentTabIndexContextType = {
  currentTabIndex: number;
  setCurrentTabIndex: (updatedIndex: number) => unknown;
};

export const CurrentTabIndexContext = createContext<CurrentTabIndexContextType>({
  currentTabIndex: 0,
  setCurrentTabIndex: () => void 0
});
