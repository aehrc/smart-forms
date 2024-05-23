import { useState } from 'react';
import GenericStatePropertyPicker from './GenericStatePropertyPicker.tsx';
import GenericViewer from './GenericViewer.tsx';
import useShowQuestionnaireResponseStoreProperty from '../../hooks/useShowQuestionnaireResponseStoreProperty.ts';

const questionnaireResponseStoreStatePropertyNames: string[] = [
  'sourceResponse',
  'updatableResponse',
  'updatableResponseItems',
  'formChangesHistory',
  'invalidItems',
  'responseIsValid'
];

function QuestionnaireResponseStoreViewer() {
  const [selectedProperty, setSelectedProperty] = useState('sourceResponse');
  const [showJsonTree, setShowJsonTree] = useState(false);

  const propertyObject = useShowQuestionnaireResponseStoreProperty(selectedProperty);

  return (
    <>
      <GenericStatePropertyPicker
        statePropertyNames={questionnaireResponseStoreStatePropertyNames}
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

export default QuestionnaireResponseStoreViewer;
