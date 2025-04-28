import { useState } from 'react';
import GenericStatePropertyPicker from './GenericStatePropertyPicker.tsx';
import GenericViewer from './GenericViewer.tsx';
import { Box, Tooltip } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useSnackbar } from 'notistack';
import { extractedResourceIsBatchBundle } from '../../api/extract.ts';
import { HEADERS } from '../../../../api/headers.ts';
import CloseSnackbar from '../../../../components/Snackbar/CloseSnackbar.tsx';
import useShowExtractedOperationStoreProperty from '../../hooks/useShowExtractedOperationStoreProperty.ts';

const extractedSectionPropertyNames: string[] = ['extractionResult', 'targetStructureMap'];

interface ExtractedSectionViewerProps {
  sourceFhirServerUrl: string;
}

function ExtractedSectionViewer(props: ExtractedSectionViewerProps) {
  const { sourceFhirServerUrl } = props;
  const [selectedProperty, setSelectedProperty] = useState('extractionResult');
  const [showJsonTree, setShowJsonTree] = useState(false);
  const [writingBack, setWritingBack] = useState(false);

  const propertyObject = useShowExtractedOperationStoreProperty(selectedProperty);
  console.log('ExtractedResourceViewer propertyObject:', propertyObject);
  const writeBackEnabled = extractedResourceIsBatchBundle(propertyObject);

  const { enqueueSnackbar } = useSnackbar();

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
        action: <CloseSnackbar />
      });
    } else {
      enqueueSnackbar(
        `Write back to ${sourceFhirServerUrl} successful. See Network tab for response`,
        {
          variant: 'success',
          preventDuplicate: true,
          action: <CloseSnackbar />
        }
      );
    }
  }

  return (
    <>
      <GenericStatePropertyPicker
        statePropertyNames={extractedSectionPropertyNames}
        selectedProperty={selectedProperty}
        onSelectProperty={setSelectedProperty}
      />
      <GenericViewer
        propertyName={selectedProperty}
        propertyObject={propertyObject}
        showJsonTree={showJsonTree}
        onToggleShowJsonTree={setShowJsonTree}>
        {selectedProperty === 'extractionResult' ? (
          <Box display="flex" justifyContent="end">
            <Tooltip
              title={
                writeBackEnabled
                  ? `Write to source FHIR server ${sourceFhirServerUrl} `
                  : 'No extracted resource to write back, or resource is not a batch/tranaction bundle.'
              }>
              <span>
                <LoadingButton
                  loading={writingBack}
                  disabled={!writeBackEnabled}
                  onClick={handleExtract}>
                  Write back
                </LoadingButton>
              </span>
            </Tooltip>
          </Box>
        ) : null}
        {/* Fallback debug view for extracted resource */}
        {propertyObject ? (
          <Box mt={2}>
            <pre style={{ maxHeight: 300, overflow: 'auto', background: '#f5f5f5', padding: 8 }}>
              {JSON.stringify(propertyObject, null, 2)}
            </pre>
          </Box>
        ) : null}
      </GenericViewer>
    </>
  );
}

export default ExtractedSectionViewer;
