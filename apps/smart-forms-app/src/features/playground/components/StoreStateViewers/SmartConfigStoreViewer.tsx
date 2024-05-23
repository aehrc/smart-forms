import { useState } from 'react';
import GenericStatePropertyPicker from './GenericStatePropertyPicker.tsx';
import GenericViewer from './GenericViewer.tsx';
import useShowSmartConfigStoreProperty from '../../hooks/useShowSmartConfigStoreProperty.ts';

const smartConfigStoreStatePropertyNames: string[] = ['client', 'patient', 'user', 'encounter'];

function SmartConfigStoreViewer() {
  const [selectedProperty, setSelectedProperty] = useState('client');
  const [showJsonTree, setShowJsonTree] = useState(false);

  const propertyObject = useShowSmartConfigStoreProperty(selectedProperty);

  return (
    <>
      <GenericStatePropertyPicker
        statePropertyNames={smartConfigStoreStatePropertyNames}
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

export default SmartConfigStoreViewer;
