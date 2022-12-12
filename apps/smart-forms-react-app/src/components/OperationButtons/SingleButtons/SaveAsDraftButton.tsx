import React from 'react';
import { ListItemButton, Typography } from '@mui/material';
import { SaveAs } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../../App';
import { Patient, Practitioner, QuestionnaireResponse } from 'fhir/r5';
import { saveQuestionnaireResponse } from '../../../functions/SaveQrFunctions';
import Client from 'fhirclient/lib/Client';
import { OperationChip } from '../../ChipBar/ChipBar.styles';

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
  const questionnaireProvider = React.useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = React.useContext(QuestionnaireResponseProviderContext);

  function handleClick() {
    questionnaireResponseProvider.setQuestionnaireResponse(questionnaireResponse);
    saveQuestionnaireResponse(
      fhirClient,
      patient,
      user,
      questionnaireProvider.questionnaire,
      questionnaireResponse
    )
      .then((response) => {
        questionnaireResponseProvider.setQuestionnaireResponse(response);
        removeQrHasChanges();
      })
      .catch((error) => console.log(error));
  }

  const renderButtonOrChip = !isChip ? (
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
