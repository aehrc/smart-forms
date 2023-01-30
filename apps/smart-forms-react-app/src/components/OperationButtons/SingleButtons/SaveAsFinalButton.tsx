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

import React, { useContext, useState } from 'react';
import { Box, ListItemButton, Tooltip, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ListItemText from '@mui/material/ListItemText';
import { Patient, Practitioner, QuestionnaireResponse } from 'fhir/r5';
import Client from 'fhirclient/lib/Client';
import { OperationChip } from '../../ChipBar/ChipBar.styles';
import ConfirmSaveAsFinalDialog from '../../Dialogs/ConfirmSaveAsFinalDialog';
import { QuestionnaireResponseProviderContext } from '../../../App';
import { SideBarIconButton } from '../../SideBar/SideBarBottom.styles';
import { SideBarContext } from '../../../custom-contexts/SideBarContext';

interface Props {
  isChip?: boolean;
  qrHasChanges?: boolean;
  removeQrHasChanges: () => unknown;
  questionnaireResponse: QuestionnaireResponse;
  fhirClient: Client;
  patient: Patient;
  user: Practitioner;
}

function SaveAsFinalButton(props: Props) {
  const {
    isChip,
    qrHasChanges,
    removeQrHasChanges,
    questionnaireResponse,
    fhirClient,
    patient,
    user
  } = props;
  const questionnaireResponseProvider = useContext(QuestionnaireResponseProviderContext);
  const sideBar = useContext(SideBarContext);

  const questionnaireResponseIsSaved: boolean =
    !!questionnaireResponseProvider.questionnaireResponse.authored &&
    !!questionnaireResponseProvider.questionnaireResponse.author;

  const [dialogOpen, setDialogOpen] = useState(false);

  function handleClick() {
    setDialogOpen(true);
  }

  const buttonTitle = 'Save as Final';

  const renderButton = (
    <ListItemButton
      disabled={
        (qrHasChanges === false ||
          (typeof qrHasChanges !== 'boolean' && qrHasChanges !== undefined)) &&
        !questionnaireResponseIsSaved
      }
      onClick={handleClick}>
      <SaveIcon sx={{ mr: 2 }} />
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
      icon={<SaveIcon fontSize="small" />}
      label={buttonTitle}
      clickable
      disabled={
        (qrHasChanges === false ||
          (typeof qrHasChanges !== 'boolean' && qrHasChanges !== undefined)) &&
        !questionnaireResponseIsSaved
      }
      onClick={handleClick}
    />
  );

  const renderIconButton = (
    <Box sx={{ m: 0.5 }}>
      <Tooltip title={buttonTitle} placement="right">
        <span>
          <SideBarIconButton
            disabled={
              (qrHasChanges === false ||
                (typeof qrHasChanges !== 'boolean' && qrHasChanges !== undefined)) &&
              !questionnaireResponseIsSaved
            }
            onClick={handleClick}>
            <SaveIcon />
          </SideBarIconButton>
        </span>
      </Tooltip>
    </Box>
  );

  return (
    <>
      {isChip ? renderChip : sideBar.isExpanded ? renderButton : renderIconButton}
      <ConfirmSaveAsFinalDialog
        dialogOpen={dialogOpen}
        closeDialog={() => setDialogOpen(false)}
        removeQrHasChanges={removeQrHasChanges}
        questionnaireResponse={questionnaireResponse}
        fhirClient={fhirClient}
        patient={patient}
        user={user}
      />
    </>
  );
}

export default SaveAsFinalButton;
