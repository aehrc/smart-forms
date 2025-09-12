/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState } from 'react';
import useShowQuestionnaireStoreProperty from '../../hooks/useShowQuestionnaireStoreProperty.ts';
import GenericViewer from './GenericViewer.tsx';
import GenericStatePropertyPicker from './GenericStatePropertyPicker.tsx';

const questionnaireStoreStatePropertyNames: string[] = [
  'sourceQuestionnaire',
  'itemMap',
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
  'initialExpressions',
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

interface QuestionnaireStoreViewerProps {
  statePropNameFilter: string;
}

function QuestionnaireStoreViewer(props: QuestionnaireStoreViewerProps) {
  const { statePropNameFilter } = props;

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

export default QuestionnaireStoreViewer;
