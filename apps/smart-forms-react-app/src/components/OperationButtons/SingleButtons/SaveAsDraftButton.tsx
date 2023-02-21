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

import React, { useContext } from 'react';
import { Box, ListItemButton, Tooltip, Typography } from '@mui/material';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import ListItemText from '@mui/material/ListItemText';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../../App';
import { Patient, Practitioner, QuestionnaireResponse } from 'fhir/r5';
import { removeHiddenAnswers, saveQuestionnaireResponse } from '../../../functions/SaveQrFunctions';
import Client from 'fhirclient/lib/Client';
import { OperationChip } from '../../ChipBar/ChipBar.styles';
import { EnableWhenContext } from '../../../custom-contexts/EnableWhenContext';
import { SideBarContext } from '../../../custom-contexts/SideBarContext';
import { SideBarIconButton } from '../../SideBar/SideBarBottom.styles';

interface Props {
  isChip?: boolean;
  qrHasChanges: boolean;
  removeQrHasChanges: () => unknown;
  questionnaireResponse: QuestionnaireResponse;
  fhirClient: Client;
  patient: Patient;
  user: Practitioner;
}

function SaveAsDraftButton(props: Props) {
  const {
    isChip,
    qrHasChanges,
    removeQrHasChanges,
    questionnaireResponse,
    fhirClient,
    patient,
    user
  } = props;
  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = useContext(QuestionnaireResponseProviderContext);

  const enableWhenContext = useContext(EnableWhenContext);
  const { sideBarIsExpanded } = useContext(SideBarContext);

  function handleClick() {
    let questionnaireResponseToSave = JSON.parse(JSON.stringify(questionnaireResponse));
    questionnaireResponseToSave = removeHiddenAnswers(
      questionnaireProvider.questionnaire,
      questionnaireResponseToSave,
      enableWhenContext
    );

    saveQuestionnaireResponse(
      fhirClient,
      patient,
      user,
      questionnaireProvider.questionnaire,
      questionnaireResponseToSave
    )
      .then((savedResponse) => {
        questionnaireResponseProvider.setQuestionnaireResponse(savedResponse);
        removeQrHasChanges();
      })
      .catch((error) => console.error(error));
  }

  const buttonTitle = 'Save as Draft';

  const renderButton = (
    <ListItemButton disabled={!qrHasChanges} onClick={handleClick} data-test="button-save-as-draft">
      <SaveAsIcon sx={{ mr: 2 }} />
      <ListItemText
        primary={
          <Typography fontSize={12} variant="h6">
            {buttonTitle}
          </Typography>
        }
      />
    </ListItemButton>
  );

  const renderChip = (
    <OperationChip
      icon={<SaveAsIcon fontSize="small" />}
      label={buttonTitle}
      clickable
      disabled={!qrHasChanges}
      onClick={handleClick}
      data-test="chip-save-as-draft"
    />
  );

  const renderIconButton = (
    <Box sx={{ m: 0.5 }} data-test="icon-button-save-as-draft-box">
      <Tooltip title={buttonTitle} placement="right">
        <span>
          <SideBarIconButton disabled={!qrHasChanges} onClick={handleClick}>
            <SaveAsIcon />
          </SideBarIconButton>
        </span>
      </Tooltip>
    </Box>
  );

  return <>{isChip ? renderChip : sideBarIsExpanded ? renderButton : renderIconButton}</>;
}

export default SaveAsDraftButton;
