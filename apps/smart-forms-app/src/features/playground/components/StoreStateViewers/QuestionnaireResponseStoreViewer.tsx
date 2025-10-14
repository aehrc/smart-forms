import { useState } from 'react';
import StorePropertyViewer from './StorePropertyViewer.tsx';
import useSelectedProperty from '../../hooks/useSelectedProperty.ts';
import { useQuestionnaireResponseStore } from '@aehrc/smart-forms-renderer';
import StorePropertyPicker from './StorePropertyPicker.tsx';

interface QuestionnaireResponseStoreViewerProps {
  propKeyFilter: string;
}

function QuestionnaireResponseStoreViewer(props: QuestionnaireResponseStoreViewerProps) {
  const { propKeyFilter } = props;

  const [selectedPropKey, setSelectedPropKey] = useState('updatableResponse');
  const [viewMode, setViewMode] = useState<'text' | 'jsonTree' | 'table'>('text');

  const { selectedPropVal, allPropKeys } = useSelectedProperty(
    selectedPropKey,
    useQuestionnaireResponseStore.use
  );

  function handleViewModeChange(newViewMethod: 'text' | 'jsonTree' | 'table' | null) {
    if (newViewMethod === null) {
      return;
    }

    setViewMode(newViewMethod);
  }

  return (
    <>
      <StorePropertyPicker
        propKeys={allPropKeys}
        propKeyFilter={propKeyFilter}
        selectedProp={selectedPropKey}
        onSelectProp={setSelectedPropKey}
      />
      <StorePropertyViewer
        selectedPropKey={selectedPropKey}
        selectedPropVal={selectedPropVal}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />
    </>
  );
}

export default QuestionnaireResponseStoreViewer;
