import React from 'react';
import { ListItemButton, Typography } from '@mui/material';
import { ChangeCircle } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { PageType, QuestionnaireSource } from '../../../interfaces/Enums';
import { PageSwitcherContext } from '../../../custom-contexts/PageSwitcherContext';
import ChangeQuestionnaireDialog from '../../Dialogs/ChangeQuestionnaireDialog';
import { OperationChip } from '../../ChipBar/ChipBar.styles';
import { QuestionnaireResponse } from 'fhir/r5';
import { LaunchContext } from '../../../custom-contexts/LaunchContext';
import { QuestionnaireProviderContext } from '../../../App';

interface Props {
  isChip?: boolean;
  qrHasChanges?: boolean;
  removeQrHasChanges?: () => unknown;
  questionnaireResponse?: QuestionnaireResponse;
}

function ChangeQuestionnaireButton(props: Props) {
  const { isChip, qrHasChanges, removeQrHasChanges, questionnaireResponse } = props;
  const pageSwitcher = React.useContext(PageSwitcherContext);
  const questionnaireProvider = React.useContext(QuestionnaireProviderContext);
  const fhirClient = React.useContext(LaunchContext).fhirClient;

  const [dialogOpen, setDialogOpen] = React.useState(false);

  function handleClick() {
    if (qrHasChanges && fhirClient && questionnaireProvider.source === QuestionnaireSource.Remote) {
      setDialogOpen(true);
    } else {
      pageSwitcher.goToPage(PageType.Picker);
    }
  }

  const renderButtonOrChip = !isChip ? (
    <ListItemButton onClick={handleClick}>
      <ChangeCircle sx={{ mr: 2 }} />
      <ListItemText
        primary={
          <Typography fontSize={12} variant="h6">
            Change Questionnaire
          </Typography>
        }
      />
    </ListItemButton>
  ) : (
    <OperationChip
      icon={<ChangeCircle fontSize="small" />}
      label="Change Questionnaire"
      clickable
      onClick={handleClick}
    />
  );

  return (
    <>
      {renderButtonOrChip}
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
