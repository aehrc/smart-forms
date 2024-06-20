import { useState } from 'react';
import GenericStatePropertyPicker from './GenericStatePropertyPicker.tsx';
import GenericViewer from './GenericViewer.tsx';

const extractedSectionPropertyNames: string[] = ['extracted'];

interface ExtractedSectionViewerProps {
  isExtracting: boolean;
  extractedResource: any;
}

function ExtractedSectionViewer(props: ExtractedSectionViewerProps) {
  const { isExtracting, extractedResource } = props;

  const [selectedProperty, setSelectedProperty] = useState('extracted');
  const [showJsonTree, setShowJsonTree] = useState(false);

  const propertyObject = isExtracting ? 'Performing extraction...' : extractedResource;

  return (
    <>
      <GenericStatePropertyPicker
        statePropertyNames={extractedSectionPropertyNames}
        selectedProperty={selectedProperty}
        onSelectProperty={setSelectedProperty}
      />
      <GenericViewer
        propertyName={selectedProperty}
        propertyObject={propertyObject}
        showJsonTree={showJsonTree}
        onToggleShowJsonTree={setShowJsonTree}
      />
    </>
  );
}

export default ExtractedSectionViewer;
