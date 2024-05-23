import { useState } from 'react';
import GenericStatePropertyPicker from './GenericStatePropertyPicker.tsx';
import GenericViewer from './GenericViewer.tsx';
import useShowTerminologyServerStoreProperty from '../../hooks/useShowTerminologyServerStoreProperty.ts';

const terminologyServerStorePropertyNames: string[] = ['url'];

function TerminologyServerStoreViewer() {
  const [selectedProperty, setSelectedProperty] = useState('url');
  const [showJsonTree, setShowJsonTree] = useState(false);

  const propertyObject = useShowTerminologyServerStoreProperty(selectedProperty);

  return (
    <>
      <GenericStatePropertyPicker
        statePropertyNames={terminologyServerStorePropertyNames}
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

export default TerminologyServerStoreViewer;
