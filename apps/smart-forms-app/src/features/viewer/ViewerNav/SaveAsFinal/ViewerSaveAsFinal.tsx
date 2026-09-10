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

import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { CircularProgress } from '@mui/material';
import { useState } from 'react';
import ViewerOperationItem from '../ViewerOperationItem.tsx';
import useSmartClient from '../../../../hooks/useSmartClient.ts';
import { useQuestionnaireResponseStore } from '@aehrc/smart-forms-renderer';
import { useSnackbar } from 'notistack';
import CloseSnackbar from '../../../../components/Snackbar/CloseSnackbar.tsx';
import { formHasErrorsViewerMessage } from '../../../../interfaces/snackbar.interface.ts';
import useSaveAsFinalExtraction from '../../../writeBack/hooks/useSaveAsFinalExtraction.tsx';
import SaveAsFinalOnlyDialog from '../../../writeBack/components/SaveAsFinalOnlyDialog.tsx';
import SaveAsFinalWriteBackDialog from '../../../writeBack/components/SaveAsFinalWriteBackDialog.tsx';

function ViewerSaveAsFinal() {
  const { smartClient } = useSmartClient();

  const [dialogOpen, setDialogOpen] = useState(false);

  const responseHasErrors = useQuestionnaireResponseStore.use.responseHasErrors();
  const highlightRequiredItems = useQuestionnaireResponseStore.use.highlightRequiredItems();

  const {
    writeBackEnabled,
    isExtracting,
    extractedBundle,
    invalidBundleEntryIndices,
    runExtraction,
    resetExtractionState
  } = useSaveAsFinalExtraction({ onExtracted: () => setDialogOpen(true) });

  const { enqueueSnackbar } = useSnackbar();

  const numOfExtractedBundleEntries = extractedBundle?.entry?.length || 0;

  function handleCloseDialog() {
    setDialogOpen(false);
  }

  function handleDialogExited() {
    resetExtractionState();
  }

  return (
    <>
      <ViewerOperationItem
        title={`Save as Final ${writeBackEnabled ? '& Write Back' : ''}`}
        icon={isExtracting ? <CircularProgress size={18} color="inherit" /> : <TaskAltIcon />}
        disabled={isExtracting}
        onClick={async () => {
          if (!smartClient) return;

          if (responseHasErrors) {
            highlightRequiredItems();
            enqueueSnackbar(formHasErrorsViewerMessage, {
              variant: 'error',
              action: <CloseSnackbar variant="error" />
            });
            return;
          }

          if (writeBackEnabled) {
            await runExtraction();
            return;
          }

          setDialogOpen(true);
        }}
      />

      {writeBackEnabled && extractedBundle && numOfExtractedBundleEntries > 0 ? (
        // An extracted bundle exists and has at least one entry
        <SaveAsFinalWriteBackDialog
          dialogOpen={dialogOpen}
          isAmendment={false}
          extractedBundle={extractedBundle}
          invalidBundleEntryIndices={invalidBundleEntryIndices ?? undefined}
          onCloseDialog={handleCloseDialog}
          onDialogExited={handleDialogExited}
        />
      ) : (
        // Extraction not supported, failed, or produced no entries
        <SaveAsFinalOnlyDialog
          open={dialogOpen}
          isAmendment={false}
          additionalContentText={
            writeBackEnabled ? 'There are no items to write back to the patient record.' : undefined
          }
          closeDialog={handleCloseDialog}
        />
      )}
    </>
  );
}

export default ViewerSaveAsFinal;
