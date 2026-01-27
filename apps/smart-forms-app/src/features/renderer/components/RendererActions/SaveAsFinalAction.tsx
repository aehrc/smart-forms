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
  buildBundleFromObservationArray,
  extractObservationBased,
  useQuestionnaireResponseStore,
  useQuestionnaireStore
} from '@aehrc/smart-forms-renderer';
import { useMemo, useState } from 'react';
import { getExtractMechanism } from '../../utils/extract.ts';
import SaveAsFinalActionButton from './SaveAsFinalActionButton.tsx';
import useSmartClient from '../../../../hooks/useSmartClient.ts';
import { extractResultIsOperationOutcome, inAppExtract } from '@aehrc/sdc-template-extract';
import type { Bundle, QuestionnaireResponse } from 'fhir/r4';
import RendererSaveAsFinalOnlyDialog from './RendererSaveAsFinalOnlyDialog.tsx';
import RendererSaveAsFinalWriteBackDialog from './RendererSaveAsFinalWriteBackDialog.tsx';
import { populateQuestionnaire } from '@aehrc/sdc-populate';
import { fetchResourceCallback } from '../../../prepopulate/utils/callback.ts';

interface SaveAsFinalActionProps extends SpeedDialActionProps {
  isSpeedDial?: boolean;
  onCloseSpeedDial?: () => void;
}

function SaveAsFinalAction(props: SaveAsFinalActionProps) {
  const { isSpeedDial, onCloseSpeedDial, ...speedDialActionProps } = props;

  const { smartClient, patient, user, encounter } = useSmartClient();

  const [saveAsFinalDialogOpen, setSaveAsFinalDialogOpen] = useState(false);
  const [isExtracting, setExtracting] = useState(false);
  const [extractedBundle, setExtractedBundle] = useState<Bundle | null>(null);

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const sourceResponse = useQuestionnaireResponseStore.use.sourceResponse();
  const updatableResponse = useQuestionnaireResponseStore.use.updatableResponse();
  const formChangesHistory = useQuestionnaireResponseStore.use.formChangesHistory();

  // Events handlers
  async function handleTemplateExtract() {
    // In the user-facing UI, always perform a modified-only extraction
    const modifiedOnly = true;

    setExtracting(true);

    // FhirClient not available, skip whole save process
    if (!smartClient || !patient || !user) {
      setExtracting(false);
      return;
    }

    // If modifiedOnly is true, populate a fresh copy of the questionnaire to compare against
    let responseToCompare: QuestionnaireResponse | null = null;
    if (modifiedOnly) {
      const populateRes = await populateQuestionnaire({
        questionnaire: sourceQuestionnaire,
        fetchResourceCallback: fetchResourceCallback,
        fetchResourceRequestConfig: {
          sourceServerUrl: smartClient.state.serverUrl,
          authToken: smartClient.state.tokenResponse?.access_token
        },
        patient: patient,
        user: user,
        encounter: encounter ?? undefined
      });

      responseToCompare = populateRes.populateResult?.populatedResponse ?? null;
    }

    // Perform template-based extraction to get a transaction bundle
    const responseToExtract = structuredClone(updatableResponse);
    const inAppExtractOutput = await inAppExtract(
      responseToExtract,
      sourceQuestionnaire,
      modifiedOnly ? responseToCompare : null
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

  function handleObservationExtract() {
    const extractedObservations = extractObservationBased(sourceQuestionnaire, updatableResponse);
    const bundleFromObservations = buildBundleFromObservationArray(extractedObservations);
    setExtractedBundle(bundleFromObservations);

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

  // Check if an in-progress QR has been saved before via versionId
  // For completed/amended, disable button only when there are no form changes
  const versionId = updatableResponse.meta?.versionId;
  const isAmendment = sourceResponse.status === 'completed' || sourceResponse.status === 'amended';
  const buttonIsDisabled =
    !smartClient || (formChangesHistory.length === 0 && !(versionId && !isAmendment));

  // Check if questionnaire can be template-based extracted
  const extractMechanism = useMemo(
    () => getExtractMechanism(sourceQuestionnaire),
    [sourceQuestionnaire]
  );
  const writeBackEnabled = !!extractMechanism;

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
            if (extractMechanism === 'template-based') {
              await handleTemplateExtract();
            }

            if (extractMechanism === 'observation-based') {
              handleObservationExtract();
            }
          }}
          {...speedDialActionProps}
        />

        {extractedBundle && numOfExtractedBundleEntries > 0 ? (
          // An extracted bundle exists and have at least one entry
          <RendererSaveAsFinalWriteBackDialog
            dialogOpen={saveAsFinalDialogOpen}
            isAmendment={isAmendment}
            extractedBundle={extractedBundle}
            onCloseDialog={handleCloseDialog}
            onDialogExited={handleDialogExited}
          />
        ) : (
          // Extraction failed or no entries in the extracted bundle
          <RendererSaveAsFinalOnlyDialog
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
        onSaveAsFinalActionClick={handleOpenDialog}
        {...speedDialActionProps}
      />
      <RendererSaveAsFinalOnlyDialog
        open={saveAsFinalDialogOpen}
        closeDialog={handleCloseDialog}
        isAmendment={isAmendment}
      />
    </>
  );
}

export default SaveAsFinalAction;
