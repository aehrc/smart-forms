import { useState } from 'react';
import GenericStatePropertyPicker from './GenericStatePropertyPicker.tsx';
import GenericViewer from './GenericViewer.tsx';
import useShowQuestionnaireResponseStoreProperty from '../../hooks/useShowQuestionnaireResponseStoreProperty.ts';

const questionnaireResponseStoreStatePropertyNames: string[] = [
  'key',
  'sourceResponse',
  'updatableResponse',
  'updatableResponseItems',
  'formChangesHistory',
  'invalidItems',
  'responseIsValid'
];

interface QuestionnaireResponseStoreViewerProps {
  statePropNameFilter: string;
}

function QuestionnaireResponseStoreViewer(props: QuestionnaireResponseStoreViewerProps) {
  const { statePropNameFilter } = props;

  const [selectedProperty, setSelectedProperty] = useState('updatableResponse');
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
        statePropertyNames={questionnaireResponseStoreStatePropertyNames}
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

export default QuestionnaireResponseStoreViewer;
