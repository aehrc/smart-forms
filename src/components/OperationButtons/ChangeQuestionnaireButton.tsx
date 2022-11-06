import React from 'react';
import { ListItemButton, Typography } from '@mui/material';
import { ChangeCircle } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { Operation, PageType } from '../../interfaces/Enums';
import { PageSwitcherContext } from '../../custom-contexts/PageSwitcherContext';
import ChangeQuestionnaireDialog from '../Dialogs/ChangeQuestionnaireDialog';
import { OperationChip } from '../ChipBar/ChipBar.styles';
import Client from 'fhirclient/lib/Client';
import { QuestionnaireResponse } from 'fhir/r5';

interface Props {
  buttonOrChip: Operation;
  qrHasChanges: boolean;
  removeQrHasChanges: () => unknown;
  fhirClient: Client | null;
  questionnaireResponse: QuestionnaireResponse;
}

function ChangeQuestionnaireButton(props: Props) {
  const { buttonOrChip, qrHasChanges, removeQrHasChanges, fhirClient, questionnaireResponse } =
    props;
  const pageSwitcher = React.useContext(PageSwitcherContext);

  const [dialogOpen, setDialogOpen] = React.useState(false);

  function handleClick() {
    if (qrHasChanges && fhirClient) {
      setDialogOpen(true);
    } else {
      pageSwitcher.goToPage(PageType.Picker);
    }
  }

  const renderButtonOrChip =
    buttonOrChip === Operation.Button ? (
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
      <ChangeQuestionnaireDialog
        dialogOpen={dialogOpen}
        closeDialog={() => setDialogOpen(false)}
        removeQrHasChanges={removeQrHasChanges}
        fhirClient={fhirClient}
        questionnaireResponse={questionnaireResponse}
      />
    </>
  );
}

export default ChangeQuestionnaireButton;
