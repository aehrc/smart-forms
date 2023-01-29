import React, { useState } from 'react';
import { PreviewModeContextType } from '../interfaces/ContextTypes';

export const PreviewModeContext = React.createContext<PreviewModeContextType>({
  isPreviewMode: false,
  setIsPreviewMode: () => void 0
});

function PreviewModeContextProvider(props: { children: React.ReactNode }) {
  const { children } = props;
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  const questionnaireActiveContext: PreviewModeContextType = {
    isPreviewMode: isPreviewMode,
    setIsPreviewMode: setIsPreviewMode
  };

  return (
    <PreviewModeContext.Provider value={questionnaireActiveContext}>
      {children}
    </PreviewModeContext.Provider>
  );
}

export default PreviewModeContextProvider;
