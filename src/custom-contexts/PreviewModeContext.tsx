import * as React from 'react';
import { PreviewModeContextType } from '../interfaces/ContextTypes';

export const PreviewModeContext = React.createContext<PreviewModeContextType>({
  previewMode: false,
  setPreviewMode: () => void 0
});

function PreviewModeContextProvider(props: { children: any }) {
  const { children } = props;
  const [previewMode, setPreviewMode] = React.useState<boolean>(false);

  const questionnaireActiveContext: PreviewModeContextType = {
    previewMode: previewMode,
    setPreviewMode: setPreviewMode
  };

  return (
    <PreviewModeContext.Provider value={questionnaireActiveContext}>
      {children}
    </PreviewModeContext.Provider>
  );
}

export default PreviewModeContextProvider;
