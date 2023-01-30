/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import React, { useContext, useState } from 'react';
import { PageSwitcherContext } from '../../custom-contexts/PageSwitcherContext';
import { PageType } from '../../interfaces/Enums';
import { removeHiddenAnswers, saveQuestionnaireResponse } from '../../functions/SaveQrFunctions';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../App';
import { QuestionnaireResponse } from 'fhir/r5';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import { EnableWhenContext } from '../../custom-contexts/EnableWhenContext';
import { EnableWhenChecksContext } from '../QRenderer/Form';

export interface Props {
  dialogOpen: boolean;
  closeDialog: () => unknown;
  removeQrHasChanges: () => unknown;
  questionnaireResponse: QuestionnaireResponse;
}

function ChangeQuestionnaireDialog(props: Props) {
  const { dialogOpen, closeDialog, removeQrHasChanges, questionnaireResponse } = props;
  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = useContext(QuestionnaireResponseProviderContext);
  const enableWhenContext = useContext(EnableWhenContext);
  const enableWhenChecksContext = useContext(EnableWhenChecksContext);

  const pageSwitcher = useContext(PageSwitcherContext);
  const launchContext = useContext(LaunchContext);

  const [isSaving, setIsSaving] = useState(false);

  function handleSave() {
    if (launchContext.fhirClient && launchContext.patient && launchContext.user) {
      let questionnaireResponseToSave = JSON.parse(JSON.stringify(questionnaireResponse));
      questionnaireResponseToSave = removeHiddenAnswers(
        questionnaireProvider.questionnaire,
        questionnaireResponseToSave,
        enableWhenContext,
        enableWhenChecksContext
      );

      setIsSaving(true);
      saveQuestionnaireResponse(
        launchContext.fhirClient,
        launchContext.patient,
        launchContext.user,
        questionnaireProvider.questionnaire,
        questionnaireResponseToSave
      )
        .then((savedResponse) => {
          questionnaireResponseProvider.setQuestionnaireResponse(savedResponse);
          removeQrHasChanges();
          pageSwitcher.goToPage(PageType.Picker);
          handleClose();
          setIsSaving(false);
        })
        .catch((error) => console.error(error));
    } else {
      handleClose();
    }
  }

  function handleClose() {
    closeDialog();
  }

  return (
    <Dialog open={dialogOpen} onClose={handleClose}>
      <DialogTitle>Changes unsaved</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {'The form has unsaved changes. Are you sure you want to change the questionnaire?'}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={() => {
            pageSwitcher.goToPage(PageType.Picker);
            handleClose();
          }}>
          Proceed without saving
        </Button>
        <Button
          disabled={isSaving}
          endIcon={isSaving ? <CircularProgress size={20} /> : null}
          onClick={handleSave}>
          Save and proceed
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ChangeQuestionnaireDialog;
