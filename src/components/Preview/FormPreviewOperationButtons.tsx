import React from 'react';
import ChangeQuestionnaireButton from '../OperationButtons/ChangeQuestionnaireButton';
import SaveAsDraftButton from '../OperationButtons/SaveAsDraftButton';
import { Operation } from '../../interfaces/Enums';
import SaveAsFinalButton from '../OperationButtons/SaveAsFinalButton';
import { QuestionnaireResponse } from 'fhir/r5';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import ContinueEditingButton from '../OperationButtons/ContinueEditingButton';

interface Props {
  buttonOrChip: Operation;
  qrHasChanges: boolean;
  removeQrHasChanges: () => unknown;
  togglePreviewMode: () => unknown;
  questionnaireResponse: QuestionnaireResponse;
}

function FormPreviewOperationButtons(props: Props) {
  const {
    buttonOrChip,
    qrHasChanges,
    removeQrHasChanges,
    togglePreviewMode,
    questionnaireResponse
  } = props;

  const fhirClient = React.useContext(LaunchContext).fhirClient;
  return (
    <>
      <ChangeQuestionnaireButton
        buttonOrChip={buttonOrChip}
        qrHasChanges={qrHasChanges}
        removeQrHasChanges={removeQrHasChanges}
        fhirClient={fhirClient}
        questionnaireResponse={questionnaireResponse}
      />
      <ContinueEditingButton buttonOrChip={buttonOrChip} togglePreviewMode={togglePreviewMode} />
      {fhirClient ? (
        <>
          <SaveAsDraftButton
            buttonOrChip={buttonOrChip}
            qrHasChanges={qrHasChanges}
            removeQrHasChanges={removeQrHasChanges}
            fhirClient={fhirClient}
            questionnaireResponse={questionnaireResponse}
          />
          <SaveAsFinalButton
            buttonOrChip={buttonOrChip}
            qrHasChanges={qrHasChanges}
            removeQrHasChanges={removeQrHasChanges}
            fhirClient={fhirClient}
            questionnaireResponse={questionnaireResponse}
          />
        </>
      ) : null}
    </>
  );
}

export default FormPreviewOperationButtons;
