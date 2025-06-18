import { useState } from 'react';
import GenericStatePropertyPicker from './GenericStatePropertyPicker.tsx';
import GenericViewer from './GenericViewer.tsx';
import useShowQuestionnaireResponseStoreProperty from '../../hooks/useShowQuestionnaireResponseStoreProperty.ts';

const terminologyServerStorePropertyNames: string[] = ['url'];

interface TerminologyServerStoreViewerProps {
  statePropNameFilter: string;
}

function TerminologyServerStoreViewer(props: TerminologyServerStoreViewerProps) {
  const { statePropNameFilter } = props;

  const [selectedProperty, setSelectedProperty] = useState('url');
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
        statePropertyNames={terminologyServerStorePropertyNames}
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

export default TerminologyServerStoreViewer;
