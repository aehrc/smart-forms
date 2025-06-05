import { useState } from 'react';
import GenericStatePropertyPicker from './GenericStatePropertyPicker.tsx';
import GenericViewer from './GenericViewer.tsx';
import useShowQuestionnaireResponseStoreProperty from '../../hooks/useShowQuestionnaireResponseStoreProperty.ts';

const smartConfigStoreStatePropertyNames: string[] = ['client', 'patient', 'user', 'encounter'];

interface QuestionnaireResponseStoreViewerProps {
  statePropNameFilter: string;
}

function SmartConfigStoreViewer(props: QuestionnaireResponseStoreViewerProps) {
  const { statePropNameFilter } = props;

  const [selectedProperty, setSelectedProperty] = useState('client');
  const [viewMode, setViewMode] = useState<'text' | 'jsonTree' | 'table'>('text');

  const propertyObject = useShowQuestionnaireResponseStoreProperty(selectedProperty);

  function handleViewModeChange(newViewMethod: 'text' | 'jsonTree' | 'table' | null) {
    if (newViewMethod === null) {
      return;
    }

    setViewMode(newViewMethod);
  }

  return (
    <>
      <GenericStatePropertyPicker
        statePropertyNames={smartConfigStoreStatePropertyNames}
        statePropNameFilter={statePropNameFilter}
        selectedProperty={selectedProperty}
        onSelectProperty={setSelectedProperty}
      />
      <GenericViewer
        propertyName={selectedProperty}
        propertyObject={propertyObject}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />
    </>
  );
}

export default SmartConfigStoreViewer;
