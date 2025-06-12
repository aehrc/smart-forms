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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { saveProgress } from '../../../../api/saveQr.ts';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { useQuestionnaireResponseStore, useQuestionnaireStore } from '@aehrc/smart-forms-renderer';
import useSmartClient from '../../../../hooks/useSmartClient.ts';
import { saveAsFinalSuccessMessage, saveErrorMessage } from '../../../../utils/snackbar.ts';
import CloseSnackbar from '../../../../components/Snackbar/CloseSnackbar.tsx';
import { HEADERS } from '../../../../api/headers.ts';
import {
  extractedResourceIsBundle,
  responseIsOperationOutcome
} from '../../../../utils/extract.ts';
import type { ExtractMechanism } from '../../utils/extract.ts';
import type Client from 'fhirclient/lib/Client';
import type { QuestionnaireResponse } from 'fhir/r4';
import { extractResultIsOperationOutcome, inAppExtract } from '@aehrc/sdc-template-extract';

export interface RendererSaveAsFinalWriteBackDialogProps {
  open: boolean;
  extractMechanism: ExtractMechanism;
  closeDialog: () => unknown;
}

function RendererSaveAsFinalWriteBackDialog(props: RendererSaveAsFinalWriteBackDialogProps) {
  const { open, extractMechanism, closeDialog } = props;

  const { smartClient, patient, user, launchQuestionnaire } = useSmartClient();

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const sourceResponse = useQuestionnaireResponseStore.use.sourceResponse();
  const updatableResponse = useQuestionnaireResponseStore.use.updatableResponse();
  const setUpdatableResponseAsSaved =
    useQuestionnaireResponseStore.use.setUpdatableResponseAsSaved();

  const [isSavingOnly, setIsSavingOnly] = useState(false);
  const [isSavingWriteBack, setIsSavingWriteBack] = useState(false);

  const navigate = useNavigate();

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  // Event Handlers
  function handleClose() {
    closeDialog();
  }

  function handleCloseWithNavigation() {
    // Wait until renderer.hasChanges is set to false before navigating away
    setTimeout(() => {
      navigate(launchQuestionnaire ? '/dashboard/existing' : '/dashboard/responses');
      setIsSavingOnly(false);
      setIsSavingWriteBack(false);
      handleClose();
    }, 1000);
  }

  async function handleSaveAsFinalOnly() {
    closeSnackbar();
    if (!(smartClient && patient && user)) {
      return;
    }

    setIsSavingOnly(true);

    const savedResponse = await saveProgress(
      smartClient,
      patient,
      user,
      sourceQuestionnaire,
      updatableResponse,
      'completed'
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

  async function handleSaveAsFinalWriteBack() {
    closeSnackbar();
    if (!(smartClient && patient && user)) {
      return;
    }

    setIsSavingWriteBack(true);

    // Perform save
    const savedResponse = await saveProgress(
      smartClient,
      patient,
      user,
      sourceQuestionnaire,
      updatableResponse,
      'completed'
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

    if (extractMechanism === 'template-based') {
      await performTemplateBasedExtractAndWriteBack(smartClient, savedResponse);
      return;
    }

    if (extractMechanism === 'structured-map') {
      await performStructureMapBasedExtractAndWriteBack(smartClient, savedResponse);
      return;
    }
  }

  async function performTemplateBasedExtractAndWriteBack(
    smartClient: Client,
    savedResponse: QuestionnaireResponse
  ) {
    const responseToExtract = structuredClone(savedResponse);
    const inAppExtractOutput = await inAppExtract(
      responseToExtract,
      sourceQuestionnaire,
      sourceResponse // Always pass in a sourceResponse since we want to extract resources only if they are modified in the form
    );

    const { extractResult } = inAppExtractOutput;

    // ExtractResult is an OperationOutcome
    if (extractResultIsOperationOutcome(extractResult)) {
      enqueueSnackbar(
        'Response saved but there are errors in creating new resources or updating existing resources. Patient record not updated.',
        {
          variant: 'warning',
          preventDuplicate: true,
          action: <CloseSnackbar variant="warning" />
        }
      );
      console.error(extractResult);
      handleCloseWithNavigation();
      return;
    }

    // At this point, ExtractResult is valid
    // Handle returnParameter
    console.log(
      `Extracted bundle from template-based extraction (modified only): `,
      extractResult.extractedBundle
    );
    const { extractedBundle } = extractResult;

    const writeBackResponse = await smartClient.request({
      url: '',
      method: 'POST',
      body: JSON.stringify(extractedBundle),
      headers: { ...HEADERS, 'Content-Type': 'application/fhir+json' }
    });

    // POST for transaction bundle failed
    if (responseIsOperationOutcome(writeBackResponse)) {
      enqueueSnackbar(
        'Response saved but failed to write back newly created/updated resources.  Patient record not updated.',
        {
          variant: 'warning',
          preventDuplicate: true,
          action: <CloseSnackbar variant="warning" />
        }
      );
      handleCloseWithNavigation();
      return;
    }

    console.log(writeBackResponse);

    // POST for transaction bundle successful
    enqueueSnackbar(
      'Response saved and newly created/updated resources are successfully saved to the Patient record.',
      {
        variant: 'success',
        preventDuplicate: true,
        action: <CloseSnackbar variant="success" />
      }
    );
    handleCloseWithNavigation();

    // TODO cant show this to the user, but still we need to inform the user what resources are created/updated - https://github.com/aehrc/smart-forms/issues/1275
    // Handle issuesParameter
    if (extractResult.issues) {
      console.warn(extractResult.issues);
    }
  }

  async function performStructureMapBasedExtractAndWriteBack(
    smartClient: Client,
    savedResponse: QuestionnaireResponse
  ) {
    // Perform structure map-based $extract
    const extractedResource = await smartClient.request({
      url: 'QuestionnaireResponse/$extract',
      method: 'POST',
      body: JSON.stringify(savedResponse),
      headers: { ...HEADERS, 'Content-Type': 'application/json' }
    });

    if (!extractedResource) {
      enqueueSnackbar('Response saved but failed to extract resource. Write back failed.', {
        variant: 'warning',
        preventDuplicate: true,
        action: <CloseSnackbar variant="warning" />
      });
      console.error(extractedResource);
      handleCloseWithNavigation();
      return;
    }

    if (!extractedResourceIsBundle(extractedResource)) {
      enqueueSnackbar(
        'Response saved but extracted resource is not a transaction bundle. Write back failed.',
        {
          variant: 'warning',
          preventDuplicate: true,
          action: <CloseSnackbar variant="warning" />
        }
      );
      console.error(extractedResource);
      handleCloseWithNavigation();
      return;
    }

    const writeBackResponse = await smartClient.request({
      url: '',
      method: 'POST',
      body: JSON.stringify(extractedResource),
      headers: { ...HEADERS, 'Content-Type': 'application/fhir+json' }
    });

    if (responseIsOperationOutcome(writeBackResponse)) {
      enqueueSnackbar(
        'Response saved but failed to write back resource. View console for details.',
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
    enqueueSnackbar('Response saved and write back successful', {
      variant: 'success',
      preventDuplicate: true,
      action: <CloseSnackbar variant="success" />
    });
    handleCloseWithNavigation();
  }

  return (
    <Dialog open={open} onClose={handleClose} data-test="dialog-confirm-save">
      <DialogTitle variant="h5">Confirm save</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {"Are you sure you want to save this form as final? You won't be able to edit it after."}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSavingOnly || isSavingWriteBack}>
          Cancel
        </Button>
        <Button
          data-test="save-as-final-button"
          loading={isSavingOnly}
          disabled={isSavingWriteBack}
          onClick={handleSaveAsFinalOnly}>
          Save as Final Only
        </Button>
        <Button
          data-test="save-as-final-write-back-button"
          loading={isSavingWriteBack}
          disabled={isSavingOnly}
          onClick={handleSaveAsFinalWriteBack}>
          Save as Final & Write Back
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RendererSaveAsFinalWriteBackDialog;
