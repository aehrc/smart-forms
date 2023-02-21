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
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import ListItemText from '@mui/material/ListItemText';
import { PageSwitcherContext } from '../../../custom-contexts/PageSwitcherContext';
import ChangeQuestionnaireDialog from '../../Dialogs/ChangeQuestionnaireDialog';
import { OperationChip } from '../../ChipBar/ChipBar.styles';
import { QuestionnaireResponse } from 'fhir/r5';
import { SideBarIconButton } from '../../SideBar/SideBarBottom.styles';
import { SideBarContext } from '../../../custom-contexts/SideBarContext';
import { PageType } from '../../../interfaces/Enums';

interface Props {
  isChip?: boolean;
  qrHasChanges?: boolean;
  removeQrHasChanges?: () => unknown;
  questionnaireResponse?: QuestionnaireResponse;
}

function ChangeQuestionnaireButton(props: Props) {
  const { isChip, qrHasChanges, removeQrHasChanges, questionnaireResponse } = props;
  const { goToPage } = useContext(PageSwitcherContext);
  const { sideBarIsExpanded } = useContext(SideBarContext);

  const [dialogOpen, setDialogOpen] = useState(false);

  function handleClick() {
    if (qrHasChanges) {
      setDialogOpen(true);
    } else {
      goToPage(PageType.Picker);
    }
  }

  const buttonTitle = 'Change Questionnaire';

  const renderButton = (
    <ListItemButton onClick={handleClick}>
      <AssignmentReturnIcon sx={{ mr: 2 }} />
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
      icon={<AssignmentReturnIcon fontSize="small" />}
      label={buttonTitle}
      clickable
      onClick={handleClick}
    />
  );

  const renderIconButton = (
    <Box sx={{ m: 0.5 }}>
      <Tooltip title={buttonTitle} placement="right">
        <span>
          <SideBarIconButton onClick={handleClick}>
            <AssignmentReturnIcon />
          </SideBarIconButton>
        </span>
      </Tooltip>
    </Box>
  );

  return (
    <>
      {isChip ? renderChip : sideBarIsExpanded ? renderButton : renderIconButton}
      {qrHasChanges && removeQrHasChanges && questionnaireResponse ? (
        <ChangeQuestionnaireDialog
          dialogOpen={dialogOpen}
          closeDialog={() => setDialogOpen(false)}
          removeQrHasChanges={removeQrHasChanges}
          questionnaireResponse={questionnaireResponse}
        />
      ) : null}
    </>
  );
}

export default ChangeQuestionnaireButton;
