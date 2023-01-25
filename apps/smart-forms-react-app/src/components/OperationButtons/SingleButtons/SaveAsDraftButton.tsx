import React from 'react';
import { ListItemButton, Typography } from '@mui/material';
import { SaveAs } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../../App';
import { Patient, Practitioner, QuestionnaireResponse } from 'fhir/r5';
import { removeHiddenAnswers, saveQuestionnaireResponse } from '../../../functions/SaveQrFunctions';
import Client from 'fhirclient/lib/Client';
import { OperationChip } from '../../ChipBar/ChipBar.styles';
import { EnableWhenContext } from '../../../custom-contexts/EnableWhenContext';
import { EnableWhenChecksContext } from '../../QRenderer/Form';

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

  const enableWhenContext = React.useContext(EnableWhenContext);
  const enableWhenChecksContext = React.useContext(EnableWhenChecksContext);

  function handleClick() {
    let questionnaireResponseToSave = JSON.parse(JSON.stringify(questionnaireResponse));
    questionnaireResponseToSave = removeHiddenAnswers(
      questionnaireProvider.questionnaire,
      questionnaireResponseToSave,
      enableWhenContext,
      enableWhenChecksContext
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
