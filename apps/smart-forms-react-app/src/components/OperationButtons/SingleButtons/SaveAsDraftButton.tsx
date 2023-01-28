import React from 'react';
import { Box, ListItemButton, Tooltip, Typography } from '@mui/material';
import { SaveAs } from '@mui/icons-material';
import ListItemText from '@mui/material/ListItemText';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../../App';
import { Patient, Practitioner, QuestionnaireResponse } from 'fhir/r5';
import { removeHiddenAnswers, saveQuestionnaireResponse } from '../../../functions/SaveQrFunctions';
import Client from 'fhirclient/lib/Client';
import { OperationChip } from '../../ChipBar/ChipBar.styles';
import { EnableWhenContext } from '../../../custom-contexts/EnableWhenContext';
import { EnableWhenChecksContext } from '../../QRenderer/Form';
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
  const questionnaireProvider = React.useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = React.useContext(QuestionnaireResponseProviderContext);

  const enableWhenContext = React.useContext(EnableWhenContext);
  const enableWhenChecksContext = React.useContext(EnableWhenChecksContext);
  const sideBar = React.useContext(SideBarContext);

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

  const buttonTitle = 'Save as Draft';

  const renderButton = (
    <ListItemButton disabled={!qrHasChanges} onClick={handleClick}>
      <SaveAs sx={{ mr: 2 }} />
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
      icon={<SaveAs fontSize="small" />}
      label={buttonTitle}
      clickable
      disabled={!qrHasChanges}
      onClick={handleClick}
    />
  );

  const renderIconButton = (
    <Box>
      <Tooltip title={buttonTitle} placement="right">
        <span>
          <SideBarIconButton disabled={!qrHasChanges} onClick={handleClick}>
            <SaveAs fontSize="small" />
          </SideBarIconButton>
        </span>
      </Tooltip>
    </Box>
  );

  return <>{isChip ? renderChip : sideBar.isExpanded ? renderButton : renderIconButton}</>;
}

export default SaveAsDraftButton;
