import { useMemo, useState } from 'react';
import { isNonEmptyBundle } from '../../typePredicates/isNonEmptyBundle.ts';
import type { Bundle, Observation } from 'fhir/r4';
import { HEADERS } from '../../../../api/headers.ts';
import CloseSnackbar from '../../../../components/Snackbar/CloseSnackbar.tsx';
import { Box, Button, Typography } from '@mui/material';
import WriteBackBundleSelectorDialog from '../../../writeBack/components/WriteBackBundleSelectorDialog.tsx';
import { useSnackbar } from 'notistack';
import { extractedResourceIsBatchBundle } from '../../api/extract.ts';
import { buildBundleFromObservationArray } from '@aehrc/smart-forms-renderer';

interface ExtractDebuggerWriteBackWrapperProps {
  sourceFhirServerUrl: string;
  selectedPropVal: any;
}

function ExtractDebuggerWriteBackWrapper(props: ExtractDebuggerWriteBackWrapperProps) {
  const { sourceFhirServerUrl, selectedPropVal } = props;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [writingBack, setWritingBack] = useState(false);

  const { bundleToWriteBack, propertyObjIsObservationArray } = useMemo(() => {
    // PropertyObject is a Bundle, return it directly
    if (extractedResourceIsBatchBundle(selectedPropVal)) {
      return { bundleToWriteBack: selectedPropVal as Bundle, propertyObjIsObservationArray: false };
    }

    // PropertyObject is an Observation array, convert it to a Bundle
    if (
      Array.isArray(selectedPropVal) &&
      selectedPropVal.length > 0 &&
      selectedPropVal.every((item) => item.resourceType === 'Observation')
    ) {
      return {
        bundleToWriteBack: buildBundleFromObservationArray(selectedPropVal as Observation[]),
        propertyObjIsObservationArray: true
      };
    }

    // Otherwise, return null
    return {
      bundleToWriteBack: null,
      propertyObjIsObservationArray: false
    };
  }, [selectedPropVal]);

  const writeBackEnabled = extractedResourceIsBatchBundle(bundleToWriteBack);

  const { enqueueSnackbar } = useSnackbar();

  // Write back extracted resource
  async function handleWriteBack(bundleToWriteBack: Bundle) {
    if (!writeBackEnabled) {
      return;
    }

    setWritingBack(true);

    const response = await fetch(sourceFhirServerUrl, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(bundleToWriteBack)
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

    setDialogOpen(false);
  }

  const showWriteBackDialog =
    !!bundleToWriteBack &&
    isNonEmptyBundle(bundleToWriteBack) &&
    !!bundleToWriteBack.entry &&
    bundleToWriteBack.entry.length > 0;

  return (
    <Box display="flex" justifyContent="end">
      {showWriteBackDialog && bundleToWriteBack ? (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'end', gap: 0.5 }}>
            <Button variant="contained" onClick={() => setDialogOpen(true)} size="small">
              Review write back items
            </Button>
            {propertyObjIsObservationArray ? (
              <Typography variant="body2" color="text.secondary">
                Observation array converted to Bundle for write back
              </Typography>
            ) : null}
          </Box>

          {/* Doing this shows the fade-in animation but the dialog unmounts immediately so no fade-out animation. We can do this in Playground, it's not user facing so that's fine.
          We need to unmount to reset states within the dialog. In the user facing environment, there is fade-out animations as we are using onDialogExited prop to reset state. */}
          {dialogOpen ? (
            <WriteBackBundleSelectorDialog
              viewMode="playground"
              dialogOpen={dialogOpen}
              isSaving={writingBack ? 'saving-write-back' : false}
              extractedBundle={bundleToWriteBack}
              onCloseDialog={() => setDialogOpen(false)}
              onWriteBackBundle={async (bundleToWriteBack) => {
                await handleWriteBack(bundleToWriteBack);
              }}
            />
          ) : null}
        </>
      ) : null}
    </Box>
  );
}

export default ExtractDebuggerWriteBackWrapper;
