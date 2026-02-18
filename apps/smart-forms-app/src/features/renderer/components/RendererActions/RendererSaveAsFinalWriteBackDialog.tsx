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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { saveProgress } from '../../../../api/saveQr.ts';
import { useQuestionnaireResponseStore, useQuestionnaireStore } from '@aehrc/smart-forms-renderer';
import useSmartClient from '../../../../hooks/useSmartClient.ts';
import {
  saveAsFinalSuccessMessage,
  saveErrorMessage
} from '../../../../interfaces/snackbar.interface.ts';
import CloseSnackbar from '../../../../components/Snackbar/CloseSnackbar.tsx';
import type { Bundle } from 'fhir/r4';
import { HEADERS } from '../../../../api/headers.ts';
import WriteBackBundleSelectorDialog from '../../../writeBack/components/WriteBackBundleSelectorDialog.tsx';
import type { SavingWriteBackMode } from '../../utils/extract.ts';
import { responseIsOperationOutcome } from '../../../../utils/operationOutcome.ts';

export interface RendererSaveAsFinalWriteBackDialogProps {
  dialogOpen: boolean;
  isAmendment: boolean;
  extractedBundle: Bundle;
  onCloseDialog: () => unknown;
  onDialogExited: () => unknown;
}

function RendererSaveAsFinalWriteBackDialog(props: RendererSaveAsFinalWriteBackDialogProps) {
  const { dialogOpen, isAmendment, extractedBundle, onCloseDialog, onDialogExited } = props;

  const { smartClient, patient, user, launchQuestionnaire } = useSmartClient();

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const updatableResponse = useQuestionnaireResponseStore.use.updatableResponse();
  const setUpdatableResponseAsSaved =
    useQuestionnaireResponseStore.use.setUpdatableResponseAsSaved();

  const [isSaving, setIsSaving] = useState<SavingWriteBackMode>(false);

  const navigate = useNavigate();

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  // Event Handlers
  function handleClose() {
    onCloseDialog();
  }

  function handleCloseWithNavigation() {
    // Wait until renderer.hasChanges is set to false before navigating away
    setTimeout(() => {
      navigate(launchQuestionnaire ? '/dashboard/existing' : '/dashboard/responses');
      setIsSaving(false);
      handleClose();
    }, 1000);
  }

  async function handleSaveAsFinalOnly() {
    closeSnackbar();
    if (!(smartClient && patient && user)) {
      return;
    }

    setIsSaving('saving-only');

    const savedResponse = await saveProgress(
      smartClient,
      patient,
      user,
      sourceQuestionnaire,
      updatableResponse,
      isAmendment ? 'amended' : 'completed'
    );

    if (!savedResponse) {
      enqueueSnackbar(saveErrorMessage, {
        variant: 'error',
        action: <CloseSnackbar variant="error" />
      });
      handleClose();
      return;
    }

    setUpdatableResponseAsSaved(savedResponse);
    enqueueSnackbar(saveAsFinalSuccessMessage, {
      variant: 'success',
      action: <CloseSnackbar variant="success" />
    });

    handleCloseWithNavigation();
  }

  async function handleWriteBack(bundleToWriteBack: Bundle) {
    closeSnackbar();
    if (!(smartClient && patient && user)) {
      return;
    }

    setIsSaving('saving-write-back');

    // Save QR first
    const savedResponse = await saveProgress(
      smartClient,
      patient,
      user,
      sourceQuestionnaire,
      updatableResponse,
      isAmendment ? 'amended' : 'completed'
    );

    // If save QR fails, skip whole write back process
    if (!savedResponse) {
      enqueueSnackbar(
        `${saveErrorMessage}. Selected items are not written back to the patient record.`,
        {
          variant: 'error',
          action: <CloseSnackbar variant="error" />
        }
      );
      handleClose();
      return;
    }
    setUpdatableResponseAsSaved(savedResponse);

    // Write back extracted bundle
    const postBundleResponse = await smartClient.request({
      url: '',
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(bundleToWriteBack)
    });

    if (responseIsOperationOutcome(postBundleResponse)) {
      enqueueSnackbar(
        'Response saved but failed to write back items into the patient record. View console for details.',
        {
          variant: 'warning',
          preventDuplicate: true,
          action: <CloseSnackbar variant="warning" />
        }
      );
      handleCloseWithNavigation();
      return;
    }

    // Happy path
    enqueueSnackbar('Response saved and items are written back successfully.', {
      variant: 'success',
      preventDuplicate: true,
      action: <CloseSnackbar variant="success" />
    });
    handleCloseWithNavigation();
  }

  return (
    <WriteBackBundleSelectorDialog
      viewMode="renderer"
      dialogOpen={dialogOpen}
      isSaving={isSaving}
      isAmendment={isAmendment}
      extractedBundle={extractedBundle}
      onCloseDialog={handleClose}
      onWriteBackBundle={async (bundleToWriteBack, savingWriteBackMode) => {
        if (savingWriteBackMode === 'saving-only') {
          await handleSaveAsFinalOnly();
        } else {
          await handleWriteBack(bundleToWriteBack);
        }
      }}
      onDialogExited={onDialogExited}
    />
  );
}

export default RendererSaveAsFinalWriteBackDialog;
