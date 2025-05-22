import { useState } from 'react';
import useShowQuestionnaireStoreProperty from '../../hooks/useShowQuestionnaireStoreProperty.ts';
import GenericViewer from './GenericViewer.tsx';
import GenericStatePropertyPicker from './GenericStatePropertyPicker.tsx';

const questionnaireStoreStatePropertyNames: string[] = [
  'sourceQuestionnaire',
  'itemTypes',
  'itemPreferredTerminologyServers',
  'tabs',
  'currentTabIndex',
  'pages',
  'currentPageIndex',
  'variables',
  'launchContexts',
  'targetConstraints',
  'targetConstraintLinkIds',
  'answerOptionsToggleExpressions',
  'enableWhenItems',
  'enableWhenLinkedQuestions',
  'enableWhenIsActivated',
  'enableWhenExpressions',
  'calculatedExpressions',
  'answerExpressions',
  'processedValueSets',
  'cachedValueSetCodings',
  'fhirPathContext',
  'fhirPathTerminologyCache',
  'populatedContext',
  'qItemOverrideComponents',
  'sdcUiOverrideComponents',
  'focusedLinkId',
  'readOnly'
];

function QuestionnaireStoreViewer() {
  const [selectedProperty, setSelectedProperty] = useState('sourceQuestionnaire');
  const [viewMode, setViewMode] = useState<'text' | 'jsonTree' | 'table'>('text');

  const propertyObject = useShowQuestionnaireStoreProperty(selectedProperty);

  function handleViewModeChange(newViewMethod: 'text' | 'jsonTree' | 'table' | null) {
    if (newViewMethod === null) {
      return;
    }

    setViewMode(newViewMethod);
  }

  return (
    <>
      <GenericStatePropertyPicker
        statePropertyNames={questionnaireStoreStatePropertyNames}
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

export default QuestionnaireStoreViewer;
