import React from 'react';
import { ListItemButton, Typography } from '@mui/material';
import { SaveAs } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { QuestionnaireResponseProviderContext } from '../../App';
import { QuestionnaireResponse } from 'fhir/r5';
import { saveQuestionnaireResponse } from '../../functions/SaveQrFunctions';
import Client from 'fhirclient/lib/Client';
import { Operation } from '../../interfaces/Enums';
import { OperationChip } from '../ChipBar/ChipBar.styles';

interface Props {
  buttonOrChip: Operation;
  qrHasChanges: boolean;
  removeQrHasChanges: () => unknown;
  questionnaireResponse: QuestionnaireResponse;
  fhirClient: Client;
}

function SaveAsDraftButton(props: Props) {
  const { buttonOrChip, qrHasChanges, removeQrHasChanges, questionnaireResponse, fhirClient } =
    props;
  const questionnaireResponseProvider = React.useContext(QuestionnaireResponseProviderContext);

  function handleClick() {
    questionnaireResponseProvider.setQuestionnaireResponse(questionnaireResponse);
    saveQuestionnaireResponse(fhirClient, questionnaireResponse)
      .then(() => removeQrHasChanges())
      .catch((error) => {
        if (error.message.includes('400 Bad Request')) {
          saveQuestionnaireResponse(fhirClient, questionnaireResponse)
            .then(() => removeQrHasChanges())
            .catch((error) => console.log(error));
        }
      });
  }

  const renderButtonOrChip =
    buttonOrChip === Operation.Button ? (
      <ListItemButton disabled={!qrHasChanges} onClick={handleClick}>
        <SaveAs sx={{ mr: 2 }} />
        <ListItemText
          primary={
            <Typography fontSize={12} variant="h6">
              Save as Draft
            </Typography>
          }
        />
      </ListItemButton>
    ) : (
      <OperationChip
        icon={<SaveAs fontSize="small" />}
        label="Save as Draft"
        clickable
        disabled={!qrHasChanges}
        onClick={handleClick}
      />
    );
  return <>{renderButtonOrChip}</>;
}

export default SaveAsDraftButton;
