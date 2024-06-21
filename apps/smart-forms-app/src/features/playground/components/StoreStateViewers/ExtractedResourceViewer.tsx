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

const extractedSectionPropertyNames: string[] = ['extractedResource', 'targetStructureMap'];

interface ExtractedSectionViewerProps {
  fhirServerUrl: string;
}

function ExtractedSectionViewer(props: ExtractedSectionViewerProps) {
  const { fhirServerUrl } = props;
  const [selectedProperty, setSelectedProperty] = useState('extractedResource');
  const [showJsonTree, setShowJsonTree] = useState(false);
  const [writingBack, setWritingBack] = useState(false);

  const propertyObject = useShowExtractedOperationStoreProperty(selectedProperty);

  const writeBackEnabled = extractedResourceIsBatchBundle(propertyObject);

  const { enqueueSnackbar } = useSnackbar();

  // Write back extracted resource
  async function handleExtract() {
    if (!writeBackEnabled) {
      return;
    }
    setWritingBack(true);

    const response = await fetch(fhirServerUrl, {
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
      enqueueSnackbar(`Write back to ${fhirServerUrl} successful. See Network tab for response`, {
        variant: 'success',
        preventDuplicate: true,
        action: <CloseSnackbar />
      });
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
        {selectedProperty === 'extractedResource' ? (
          <Box display="flex" justifyContent="end">
            <Tooltip
              title={
                writeBackEnabled
                  ? `Write to source FHIR server ${fhirServerUrl} `
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
      </GenericViewer>
    </>
  );
}

export default ExtractedSectionViewer;
