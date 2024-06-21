import { useState } from 'react';
import GenericStatePropertyPicker from './GenericStatePropertyPicker.tsx';
import GenericViewer from './GenericViewer.tsx';
import { useExtractOperationStore } from '../../stores/smartConfigStore.ts';

const extractedSectionPropertyNames: string[] = ['extracted'];

function ExtractedSectionViewer() {
  const [selectedProperty, setSelectedProperty] = useState('extracted');
  const [showJsonTree, setShowJsonTree] = useState(false);

  const extractedResource = useExtractOperationStore.use.extractedResource();

  return (
    <>
      <GenericStatePropertyPicker
        statePropertyNames={extractedSectionPropertyNames}
        selectedProperty={selectedProperty}
        onSelectProperty={setSelectedProperty}
      />
      <GenericViewer
        propertyName={selectedProperty}
        propertyObject={extractedResource}
        showJsonTree={showJsonTree}
        onToggleShowJsonTree={setShowJsonTree}
      />
    </>
  );
}

export default ExtractedSectionViewer;
