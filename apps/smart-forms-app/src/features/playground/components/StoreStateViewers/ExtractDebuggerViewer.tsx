import { useState } from 'react';
import GenericStatePropertyPicker from './GenericStatePropertyPicker.tsx';
import GenericViewer from './GenericViewer.tsx';
import useShowExtractDebuggerStoreProperty from '../../hooks/useShowExtractDebuggerStoreProperty.ts';
import TemplateExtractDebugTable from './TemplateExtractDebugTable.tsx';
import type { TemplateExtractDebugInfo } from '@aehrc/sdc-template-extract';
import type { FhirResource, Observation } from 'fhir/r4';
import ExtractDebuggerWriteBackWrapper from './ExtractDebuggerWriteBackWrapper.tsx';

const extractDebuggerPropertyNames: string[] = [
  'observationExtractResult',
  'templateExtractResult',
  'templateExtractDebugInfo',
  'templateExtractIssues'
];

interface ExtractDebuggerViewerProps {
  sourceFhirServerUrl: string;
  statePropNameFilter: string;
}

function ExtractDebuggerViewer(props: ExtractDebuggerViewerProps) {
  const { sourceFhirServerUrl, statePropNameFilter } = props;

  const [selectedProperty, setSelectedProperty] = useState('templateExtractResult');
  const [viewMode, setViewMode] = useState<'text' | 'jsonTree' | 'table'>('text');

  const propertyObject = useShowExtractDebuggerStoreProperty(selectedProperty);

  function handleViewModeChange(newViewMethod: 'text' | 'jsonTree' | 'table' | null) {
    if (newViewMethod === null) {
      return;
    }

    setViewMode(newViewMethod);
  }

  const writeBackButtonShown =
    selectedProperty === 'observationExtractResult' || selectedProperty === 'templateExtractResult';

  const templateExtractPathTableShown = selectedProperty === 'templateExtractDebugInfo';

  return (
    <>
      <GenericStatePropertyPicker
        statePropertyNames={extractDebuggerPropertyNames}
        statePropNameFilter={statePropNameFilter}
        selectedProperty={selectedProperty}
        onSelectProperty={setSelectedProperty}
      />
      <GenericViewer
        propertyName={selectedProperty}
        propertyObject={propertyObject}
        viewMode={viewMode}
        showTableView={selectedProperty === 'templateExtractDebugInfo'}
        onViewModeChange={handleViewModeChange}>
        {writeBackButtonShown ? (
          <ExtractDebuggerWriteBackWrapper
            sourceFhirServerUrl={sourceFhirServerUrl}
            propertyObject={propertyObject}
          />
        ) : null}

        {/* Show TemplateExtractDebugInfo in table view */}
        {templateExtractPathTableShown &&
        viewMode === 'table' &&
        propertyObjectIsTemplateExtractDebugInfo(propertyObject) ? (
          <TemplateExtractDebugTable templateExtractDebugInfo={propertyObject} />
        ) : null}
      </GenericViewer>
    </>
  );
}

export default ExtractDebuggerViewer;

function propertyObjectIsTemplateExtractDebugInfo(
  propertyObject: Observation[] | FhirResource | TemplateExtractDebugInfo | null
): propertyObject is TemplateExtractDebugInfo {
  if (!propertyObject) {
    return false;
  }

  return (
    'templateIdToExtractPathTuples' in propertyObject &&
    typeof propertyObject.templateIdToExtractPathTuples === 'object'
  );
}
