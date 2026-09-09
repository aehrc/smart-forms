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

import type { SpeedDialActionProps } from '@mui/material';
import {
  getBaseLinkIdFromErrorKey,
  useQuestionnaireResponseStore,
  useQuestionnaireStore
} from '@aehrc/smart-forms-renderer';
import { useState } from 'react';
import SaveAsFinalActionButton from './SaveAsFinalActionButton.tsx';
import useSmartClient from '../../../../hooks/useSmartClient.ts';
import SaveAsFinalOnlyDialog from '../../../writeBack/components/SaveAsFinalOnlyDialog.tsx';
import SaveAsFinalWriteBackDialog from '../../../writeBack/components/SaveAsFinalWriteBackDialog.tsx';
import { useSnackbar } from 'notistack';
import CloseSnackbar from '../../../../components/Snackbar/CloseSnackbar.tsx';
import { formHasErrorsMessage } from '../../../../interfaces/snackbar.interface.ts';
import { findFirstErrorTabIndex } from '../../utils/tabNavigation.ts';
import useSaveAsFinalExtraction from '../../../writeBack/hooks/useSaveAsFinalExtraction.ts';

interface SaveAsFinalActionProps extends SpeedDialActionProps {
  isSpeedDial?: boolean;
  onCloseSpeedDial?: () => void;
}

function SaveAsFinalAction(props: SaveAsFinalActionProps) {
  const { isSpeedDial, onCloseSpeedDial, ...speedDialActionProps } = props;

  const { smartClient } = useSmartClient();

  const [saveAsFinalDialogOpen, setSaveAsFinalDialogOpen] = useState(false);

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const tabs = useQuestionnaireStore.use.tabs();
  const switchTab = useQuestionnaireStore.use.switchTab();

  const sourceResponse = useQuestionnaireResponseStore.use.sourceResponse();
  const updatableResponse = useQuestionnaireResponseStore.use.updatableResponse();
  const formChangesHistory = useQuestionnaireResponseStore.use.formChangesHistory();
  const responseHasErrors = useQuestionnaireResponseStore.use.responseHasErrors();
  const invalidItems = useQuestionnaireResponseStore.use.invalidItems();
  const highlightRequiredItems = useQuestionnaireResponseStore.use.highlightRequiredItems();

  const {
    writeBackEnabled,
    isExtracting,
    extractedBundle,
    invalidBundleEntryIndices,
    runExtraction,
    resetExtractionState
  } = useSaveAsFinalExtraction({ onExtracted: () => handleOpenDialog() });

  const { enqueueSnackbar } = useSnackbar();

  // freeze state of response status so dialog content doesn't change during the save process
  const [responseStatus] = useState(sourceResponse.status);

  // Returns true if save should be aborted due to validation errors
  function handleValidationErrors(): boolean {
    if (!responseHasErrors) return false;

    highlightRequiredItems();

    if (Object.keys(tabs).length > 0) {
      // invalidItems keys may be instance-scoped (e.g. `linkId///1` for repeating groups),
      // so map them back to their base linkId before matching against questionnaire items
      const invalidLinkIds = Object.keys(invalidItems).map(getBaseLinkIdFromErrorKey);
      const firstErrorTabIndex = findFirstErrorTabIndex(
        invalidLinkIds,
        sourceQuestionnaire.item ?? [],
        tabs
      );
      if (firstErrorTabIndex !== null) {
        switchTab(firstErrorTabIndex);
      }
    }

    enqueueSnackbar(formHasErrorsMessage, {
      variant: 'error',
      action: <CloseSnackbar variant="error" />
    });

    return true;
  }

  // Events handlers
  function handleOpenDialog() {
    // Close speedDial (if open)
    if (onCloseSpeedDial) {
      onCloseSpeedDial();
    }

    // Open dialog
    if (smartClient) {
      setSaveAsFinalDialogOpen(true);
    }
  }

  function handleCloseDialog() {
    // Close speedDial (if open)
    if (onCloseSpeedDial) {
      onCloseSpeedDial();
    }

    // Close dialog
    setSaveAsFinalDialogOpen(false);
  }

  // This is for the write back dialog's onExited event.
  // e.g.
  // slotProps={{
  //   transition: {
  //     onExited: onDialogExited
  //   }
  // }}
  function handleDialogExited() {
    resetExtractionState();
  }

  // Check if an in-progress QR has been saved before via versionId
  // For completed/amended, disable button only when there are no form changes
  const versionId = updatableResponse.meta?.versionId;
  const isAmendment = responseStatus === 'completed' || responseStatus === 'amended';
  const buttonIsDisabled =
    !smartClient || (formChangesHistory.length === 0 && !(versionId && !isAmendment));

  const numOfExtractedBundleEntries = extractedBundle?.entry?.length || 0;

  if (writeBackEnabled) {
    return (
      <>
        <SaveAsFinalActionButton
          isSpeedDial={!!isSpeedDial}
          isExtracting={isExtracting}
          isDisabled={buttonIsDisabled}
          isAmendment={isAmendment}
          writeBackEnabled={writeBackEnabled}
          onSaveAsFinalActionClick={async () => {
            if (handleValidationErrors()) return;

            await runExtraction();
          }}
          {...speedDialActionProps}
        />

        {extractedBundle && numOfExtractedBundleEntries > 0 ? (
          // An extracted bundle exists and have at least one entry
          <SaveAsFinalWriteBackDialog
            dialogOpen={saveAsFinalDialogOpen}
            isAmendment={isAmendment}
            extractedBundle={extractedBundle}
            invalidBundleEntryIndices={invalidBundleEntryIndices ?? undefined}
            onCloseDialog={handleCloseDialog}
            onDialogExited={handleDialogExited}
          />
        ) : (
          // Extraction failed or no entries in the extracted bundle
          <SaveAsFinalOnlyDialog
            open={saveAsFinalDialogOpen}
            isAmendment={isAmendment}
            additionalContentText={'There are no items to write back to the patient record.'}
            closeDialog={handleCloseDialog}
          />
        )}
      </>
    );
  }

  return (
    <>
      <SaveAsFinalActionButton
        isSpeedDial={!!isSpeedDial}
        isExtracting={false}
        isDisabled={buttonIsDisabled}
        isAmendment={isAmendment}
        writeBackEnabled={writeBackEnabled}
        onSaveAsFinalActionClick={() => {
          if (handleValidationErrors()) return;
          handleOpenDialog();
        }}
        {...speedDialActionProps}
      />
      <SaveAsFinalOnlyDialog
        open={saveAsFinalDialogOpen}
        closeDialog={handleCloseDialog}
        isAmendment={isAmendment}
      />
    </>
  );
}

export default SaveAsFinalAction;
