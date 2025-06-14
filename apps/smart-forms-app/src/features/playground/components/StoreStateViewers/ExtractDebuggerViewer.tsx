import { useState } from 'react';
import GenericStatePropertyPicker from './GenericStatePropertyPicker.tsx';
import GenericViewer from './GenericViewer.tsx';
import { Box, Button, Tooltip } from '@mui/material';
import { useSnackbar } from 'notistack';
import { extractedResourceIsBatchBundle } from '../../api/extract.ts';
import { HEADERS } from '../../../../api/headers.ts';
import CloseSnackbar from '../../../../components/Snackbar/CloseSnackbar.tsx';
import useShowExtractDebuggerStoreProperty from '../../hooks/useShowExtractDebuggerStoreProperty.ts';
import TemplateExtractDebugTable from './TemplateExtractDebugTable.tsx';
import type { TemplateExtractDebugInfo } from '@aehrc/sdc-template-extract';
import type { FhirResource, Observation } from 'fhir/r4';

const extractDebuggerPropertyNames: string[] = [
  'observationExtractResult',
  'templateExtractResult',
  'templateExtractDebugInfo',
  'templateExtractIssues',
  'structuredMapExtractMap',
  'structuredMapExtractResult'
];

interface ExtractDebuggerViewerProps {
  sourceFhirServerUrl: string;
  statePropNameFilter: string;
}

function ExtractDebuggerViewer(props: ExtractDebuggerViewerProps) {
  const { sourceFhirServerUrl, statePropNameFilter } = props;

  const [selectedProperty, setSelectedProperty] = useState('templateExtractResult');
  const [viewMode, setViewMode] = useState<'text' | 'jsonTree' | 'table'>('text');

  const [writingBack, setWritingBack] = useState(false);

  const propertyObject = useShowExtractDebuggerStoreProperty(selectedProperty);
  const writeBackEnabled = extractedResourceIsBatchBundle(propertyObject);

  const { enqueueSnackbar } = useSnackbar();

  function handleViewModeChange(newViewMethod: 'text' | 'jsonTree' | 'table' | null) {
    if (newViewMethod === null) {
      return;
    }

    setViewMode(newViewMethod);
  }

  // Write back extracted resource
  async function handleExtract() {
    if (!writeBackEnabled) {
      return;
    }
    setWritingBack(true);

    const response = await fetch(sourceFhirServerUrl, {
      method: 'POST',
      headers: { ...HEADERS, 'Content-Type': 'application/json;charset=utf-8' },
      body: JSON.stringify(propertyObject)
    });
    setWritingBack(false);

    if (!response.ok) {
      enqueueSnackbar('Failed to write back resource', {
        variant: 'error',
        preventDuplicate: true,
        action: <CloseSnackbar variant="error" />
      });
    } else {
      enqueueSnackbar(
        `Write back to ${sourceFhirServerUrl} successful. See Network tab for response`,
        {
          variant: 'success',
          preventDuplicate: true,
          action: <CloseSnackbar variant="success" />
        }
      );
    }
  }

  const writeBackButtonShown =
    selectedProperty === 'observationExtractResult' ||
    selectedProperty === 'templateExtractResult' ||
    selectedProperty === 'structuredMapExtractResult';

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
          <Box display="flex" justifyContent="end">
            <Tooltip
              title={
                writeBackEnabled
                  ? `Write to source FHIR server ${sourceFhirServerUrl} `
                  : 'No extracted resource to write back, or resource is not a batch/tranaction bundle.'
              }>
              <span>
                <Button loading={writingBack} disabled={!writeBackEnabled} onClick={handleExtract}>
                  Write back
                </Button>
              </span>
            </Tooltip>
          </Box>
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
