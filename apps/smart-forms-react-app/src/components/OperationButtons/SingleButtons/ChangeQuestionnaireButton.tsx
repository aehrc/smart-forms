import React, { useContext, useState } from 'react';
import { Box, ListItemButton, Tooltip, Typography } from '@mui/material';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import ListItemText from '@mui/material/ListItemText';
import { PageType, QuestionnaireSource } from '../../../interfaces/Enums';
import { PageSwitcherContext } from '../../../custom-contexts/PageSwitcherContext';
import ChangeQuestionnaireDialog from '../../Dialogs/ChangeQuestionnaireDialog';
import { OperationChip } from '../../ChipBar/ChipBar.styles';
import { QuestionnaireResponse } from 'fhir/r5';
import { LaunchContext } from '../../../custom-contexts/LaunchContext';
import { QuestionnaireProviderContext } from '../../../App';
import { SideBarIconButton } from '../../SideBar/SideBarBottom.styles';
import { SideBarContext } from '../../../custom-contexts/SideBarContext';

interface Props {
  isChip?: boolean;
  qrHasChanges?: boolean;
  removeQrHasChanges?: () => unknown;
  questionnaireResponse?: QuestionnaireResponse;
}

function ChangeQuestionnaireButton(props: Props) {
  const { isChip, qrHasChanges, removeQrHasChanges, questionnaireResponse } = props;
  const pageSwitcher = useContext(PageSwitcherContext);
  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const fhirClient = useContext(LaunchContext).fhirClient;
  const sideBar = useContext(SideBarContext);

  const [dialogOpen, setDialogOpen] = useState(false);

  function handleClick() {
    if (qrHasChanges && fhirClient && questionnaireProvider.source === QuestionnaireSource.Remote) {
      setDialogOpen(true);
    } else {
      pageSwitcher.goToPage(PageType.Picker);
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
      {isChip ? renderChip : sideBar.isExpanded ? renderButton : renderIconButton}
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
