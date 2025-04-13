import { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { GenericViewer } from '../../../../components/GenericViewer';
import { useShowExtractedOperationStoreProperty } from '../../../playground/hooks/useShowExtractedOperationStoreProperty';
import { HEADERS } from '../../../../utils/constants';
import { extractedResourceIsBatchBundle } from '../../../../utils/extract';

export const ExtractedResourceViewer = () => {
  const [selectedProperty, setSelectedProperty] = useState<'extractionResult' | 'targetStructureMap'>('extractionResult');
  const [showJsonTree, setShowJsonTree] = useState(false);
  const [writingBack, setWritingBack] = useState(false);

  const propertyObject = useShowExtractedOperationStoreProperty(selectedProperty);
  const writeBackEnabled = selectedProperty === 'extractionResult' && extractedResourceIsBatchBundle(propertyObject);

  const { enqueueSnackbar } = useSnackbar();

  const handleWriteBack = async () => {
    setWritingBack(true);
    try {
      const response = await fetch('/api/fhir', {
        method: 'POST',
        headers: { ...HEADERS, 'Content-Type': 'application/json;charset=utf-8' },
        body: JSON.stringify(propertyObject)
      });
      setWritingBack(false);
      if (response.ok) {
        enqueueSnackbar('Successfully wrote back to FHIR server', { variant: 'success' });
      } else {
        enqueueSnackbar('Failed to write back to FHIR server', { variant: 'error' });
      }
    } catch (error) {
      setWritingBack(false);
      enqueueSnackbar('Error writing back to FHIR server', { variant: 'error' });
    }
  };

  return (
    <Box>
      <FormControl fullWidth>
        <InputLabel>Property</InputLabel>
        <Select
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value as 'extractionResult' | 'targetStructureMap')}
        >
          <MenuItem value="extractionResult">Extraction Result</MenuItem>
          <MenuItem value="targetStructureMap">Target Structure Map</MenuItem>
        </Select>
      </FormControl>

      {writeBackEnabled && (
        <Box mt={2}>
          <Button variant="contained" color="primary" onClick={handleWriteBack} disabled={writingBack}>
            Write Back to FHIR Server
          </Button>
        </Box>
      )}

      <Box mt={2}>
        <GenericViewer
          propertyName={selectedProperty}
          propertyObject={propertyObject}
          showJsonTree={showJsonTree}
          onToggleShowJsonTree={setShowJsonTree}
        />
      </Box>

      <Dialog open={writingBack}>
        <DialogTitle>Writing Back to FHIR Server</DialogTitle>
        <DialogContent>
          <Typography>Please wait while we write back to the FHIR server...</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWritingBack(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
