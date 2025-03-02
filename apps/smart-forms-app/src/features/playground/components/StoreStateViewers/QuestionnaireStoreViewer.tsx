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
  'enableWhenItems',
  'enableWhenLinkedQuestions',
  'enableWhenIsActivated',
  'enableWhenExpressions',
  'calculatedExpressions',
  'answerExpressions',
  'processedValueSetCodings',
  'processedValueSetUrls',
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
  const [showJsonTree, setShowJsonTree] = useState(false);

  const propertyObject = useShowQuestionnaireStoreProperty(selectedProperty);

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
        showJsonTree={showJsonTree}
        onToggleShowJsonTree={setShowJsonTree}
      />
    </>
  );
}

export default QuestionnaireStoreViewer;
