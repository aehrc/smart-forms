import { useState } from 'react';
import { isNonEmptyBundle } from '../../typePredicates/isNonEmptyBundle.ts';
import type { Bundle } from 'fhir/r4';
import { HEADERS } from '../../../../api/headers.ts';
import CloseSnackbar from '../../../../components/Snackbar/CloseSnackbar.tsx';
import { Box, Button } from '@mui/material';
import WriteBackBundleSelectorDialog from '../../../writeBack/components/WriteBackBundleSelectorDialog.tsx';
import { useSnackbar } from 'notistack';
import { extractedResourceIsBatchBundle } from '../../api/extract.ts';

interface ExtractDebuggerWriteBackWrapperProps {
  sourceFhirServerUrl: string;
  propertyObject: any;
}

function ExtractDebuggerWriteBackWrapper(props: ExtractDebuggerWriteBackWrapperProps) {
  const { sourceFhirServerUrl, propertyObject } = props;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [writingBack, setWritingBack] = useState(false);

  const writeBackEnabled = extractedResourceIsBatchBundle(propertyObject);

  const { enqueueSnackbar } = useSnackbar();

  // FIXME test against structured map

  // Write back extracted resource
  async function handleWriteBack(bundleToWriteBack: Bundle) {
    if (!writeBackEnabled) {
      return;
    }

    setWritingBack(true);

    const response = await fetch(sourceFhirServerUrl, {
      method: 'POST',
      headers: { ...HEADERS, 'Content-Type': 'application/json;charset=utf-8' },
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
    !!propertyObject &&
    isNonEmptyBundle(propertyObject) &&
    !!propertyObject.entry &&
    propertyObject.entry.length > 0;

  return (
    <Box display="flex" justifyContent="end">
      {showWriteBackDialog && propertyObject ? (
        <>
          <Button variant="contained" onClick={() => setDialogOpen(true)} size="small">
            Review write back items
          </Button>

          {/* Doing this shows the fade-in animation but the dialog unmounts immediately so no fade-out animation. We can do this in Playground, it's not user facing so that's fine.
          We need to unmount to reset states within the dialog. In the user facing environment, there is fade-out animations as we are using onDialogExited prop to reset state. */}
          {dialogOpen ? (
            <WriteBackBundleSelectorDialog
              viewMode="playground"
              dialogOpen={dialogOpen}
              isSaving={writingBack ? 'saving-write-back' : false}
              extractedBundle={propertyObject}
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
