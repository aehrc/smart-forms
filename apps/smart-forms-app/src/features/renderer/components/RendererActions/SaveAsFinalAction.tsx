/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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
import { useQuestionnaireResponseStore, useQuestionnaireStore } from '@aehrc/smart-forms-renderer';
import { useMemo, useState } from 'react';
import { useExtractDebuggerStore } from '../../../playground/stores/extractDebuggerStore.ts';
import { getExtractMechanism } from '../../utils/extract.ts';
import SaveAsFinalActionButton from './SaveAsFinalActionButton.tsx';
import useSmartClient from '../../../../hooks/useSmartClient.ts';
import { extractResultIsOperationOutcome, inAppExtract } from '@aehrc/sdc-template-extract';
import type { Bundle } from 'fhir/r4';
import RendererSaveAsFinalOnlyDialog from './RendererSaveAsFinalOnlyDialog.tsx';
import RendererSaveAsFinalWriteBackDialog from './RendererSaveAsFinalWriteBackDialog.tsx';

interface SaveAsFinalActionProps extends SpeedDialActionProps {
  isSpeedDial?: boolean;
  onCloseSpeedDial?: () => void;
}

function SaveAsFinalAction(props: SaveAsFinalActionProps) {
  const { isSpeedDial, onCloseSpeedDial, ...speedDialActionProps } = props;

  const { smartClient } = useSmartClient();

  const [saveAsFinalDialogOpen, setSaveAsFinalDialogOpen] = useState(false);
  const [isExtracting, setExtracting] = useState(false);
  const [extractedBundle, setExtractedBundle] = useState<Bundle | null>(null);

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const sourceResponse = useQuestionnaireResponseStore.use.sourceResponse();
  const updatableResponse = useQuestionnaireResponseStore.use.updatableResponse();
  const formChangesHistory = useQuestionnaireResponseStore.use.formChangesHistory();

  const structuredMapExtractMap = useExtractDebuggerStore.use.structuredMapExtractMap();

  // Events handlers
  async function handleTemplateExtract() {
    // In the user-facing UI, always perform a modified-only extraction
    const modifiedOnly = true;

    setExtracting(true);

    // FhirClient not available, skip whole save process
    if (!smartClient) {
      setExtracting(false);
      return;
    }

    // Perform template-based extracted to get a transaction bundle
    const responseToExtract = structuredClone(updatableResponse);
    const inAppExtractOutput = await inAppExtract(
      responseToExtract,
      sourceQuestionnaire,
      modifiedOnly ? sourceResponse : null
    );

    const { extractResult } = inAppExtractOutput;

    if (extractResultIsOperationOutcome(extractResult)) {
      console.error(extractResult);
      setExtracting(false);
      return;
    }

    setExtractedBundle(extractResult.extractedBundle);
    setExtracting(false);

    // Open dialog after extraction is complete
    handleOpenDialog();
  }

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
    // Reset extract-related states back to false
    setExtracting(false);
    setExtractedBundle(null);
  }

  const responseWasSaved = !!updatableResponse.authored && !!updatableResponse.author;
  const buttonIsDisabled = !responseWasSaved && formChangesHistory.length === 0;

  // Check if questionnaire can be template-based extracted
  const extractMechanism = useMemo(
    () => getExtractMechanism(sourceQuestionnaire, structuredMapExtractMap),
    [sourceQuestionnaire, structuredMapExtractMap]
  );
  const writeBackEnabled = !!extractMechanism;

  // Write back enabled for this questionnaire, include write back dialog
  // if (writeBackEnabled) {

  const numOfExtractedBundleEntries = extractedBundle?.entry?.length || 0;

  if (extractMechanism === 'template-based') {
    return (
      <>
        <SaveAsFinalActionButton
          isSpeedDial={!!isSpeedDial}
          isExtracting={isExtracting}
          isDisabled={buttonIsDisabled}
          writeBackEnabled={writeBackEnabled}
          onSaveAsFinalActionClick={handleTemplateExtract}
          {...speedDialActionProps}
        />

        {extractedBundle && numOfExtractedBundleEntries > 0 ? (
          // An extracted bundle exists and have at least one entry
          <RendererSaveAsFinalWriteBackDialog
            dialogOpen={saveAsFinalDialogOpen}
            extractedBundle={extractedBundle}
            onCloseDialog={handleCloseDialog}
            onDialogExited={handleDialogExited}
          />
        ) : (
          // Extraction failed or no entries in the extracted bundle
          <RendererSaveAsFinalOnlyDialog
            open={saveAsFinalDialogOpen}
            customContentText={
              'There are no items to write back to the patient record. Are you sure you want to save this form as final? You will not be able to make further changes.'
            }
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
        writeBackEnabled={writeBackEnabled}
        onSaveAsFinalActionClick={handleOpenDialog}
        {...speedDialActionProps}
      />
      <RendererSaveAsFinalOnlyDialog open={saveAsFinalDialogOpen} closeDialog={handleCloseDialog} />
    </>
  );
}

export default SaveAsFinalAction;
