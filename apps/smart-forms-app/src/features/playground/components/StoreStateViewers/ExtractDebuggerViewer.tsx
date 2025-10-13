import { useState } from 'react';
import StorePropertyViewer from './StorePropertyViewer.tsx';
import TemplateExtractDebugTable from './TemplateExtractDebugTable.tsx';
import type { TemplateExtractDebugInfo } from '@aehrc/sdc-template-extract';
import type { FhirResource, Observation } from 'fhir/r4';
import ExtractDebuggerWriteBackWrapper from './ExtractDebuggerWriteBackWrapper.tsx';
import useSelectedProperty from '../../hooks/useSelectedProperty.ts';
import { useExtractDebuggerStore } from '../../stores/extractDebuggerStore.ts';
import StorePropertyPicker from './StorePropertyPicker.tsx';

interface ExtractDebuggerViewerProps {
  sourceFhirServerUrl: string;
  propKeyFilter: string;
}

function ExtractDebuggerViewer(props: ExtractDebuggerViewerProps) {
  const { sourceFhirServerUrl, propKeyFilter } = props;

  const [selectedPropKey, setSelectedPropKey] = useState('templateExtractResult');
  const [viewMode, setViewMode] = useState<'text' | 'jsonTree' | 'table'>('text');

  const { selectedPropVal, allPropKeys } = useSelectedProperty(
    selectedPropKey,
    useExtractDebuggerStore.use
  );

  function handleViewModeChange(newViewMethod: 'text' | 'jsonTree' | 'table' | null) {
    if (newViewMethod === null) {
      return;
    }

    setViewMode(newViewMethod);
  }

  const writeBackButtonShown =
    selectedPropKey === 'observationExtractResult' || selectedPropKey === 'templateExtractResult';

  const templateExtractPathTableShown = selectedPropKey === 'templateExtractDebugInfo';

  return (
    <>
      <StorePropertyPicker
        propKeys={allPropKeys}
        propKeyFilter={propKeyFilter}
        selectedProp={selectedPropKey}
        onSelectProp={setSelectedPropKey}
      />
      <StorePropertyViewer
        selectedPropKey={selectedPropKey}
        selectedPropVal={selectedPropVal}
        viewMode={viewMode}
        showTableView={selectedPropKey === 'templateExtractDebugInfo'}
        onViewModeChange={handleViewModeChange}>
        {writeBackButtonShown ? (
          <ExtractDebuggerWriteBackWrapper
            sourceFhirServerUrl={sourceFhirServerUrl}
            selectedPropVal={selectedPropVal}
          />
        ) : null}

        {/* Show TemplateExtractDebugInfo in table view */}
        {templateExtractPathTableShown &&
        viewMode === 'table' &&
        propertyObjectIsTemplateExtractDebugInfo(selectedPropVal) ? (
          <TemplateExtractDebugTable templateExtractDebugInfo={selectedPropVal} />
        ) : null}
      </StorePropertyViewer>
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
