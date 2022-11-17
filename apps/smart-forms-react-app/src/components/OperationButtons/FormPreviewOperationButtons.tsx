import React from 'react';
import ChangeQuestionnaireButton from './SingleButtons/ChangeQuestionnaireButton';
import SaveAsDraftButton from './SingleButtons/SaveAsDraftButton';
import { Operation } from '../../interfaces/Enums';
import SaveAsFinalButton from './SingleButtons/SaveAsFinalButton';
import { QuestionnaireResponse } from 'fhir/r5';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import ContinueEditingButton from './SingleButtons/ContinueEditingButton';

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

  const launch = React.useContext(LaunchContext);
  return (
    <>
      <ChangeQuestionnaireButton
        buttonOrChip={buttonOrChip}
        qrHasChanges={qrHasChanges}
        removeQrHasChanges={removeQrHasChanges}
        questionnaireResponse={questionnaireResponse}
      />
      <ContinueEditingButton buttonOrChip={buttonOrChip} togglePreviewMode={togglePreviewMode} />
      {launch.fhirClient && launch.user && launch.patient ? (
        <>
          <SaveAsDraftButton
            buttonOrChip={buttonOrChip}
            qrHasChanges={qrHasChanges}
            removeQrHasChanges={removeQrHasChanges}
            questionnaireResponse={questionnaireResponse}
            fhirClient={launch.fhirClient}
            patient={launch.patient}
            user={launch.user}
          />
          <SaveAsFinalButton
            buttonOrChip={buttonOrChip}
            qrHasChanges={qrHasChanges}
            removeQrHasChanges={removeQrHasChanges}
            questionnaireResponse={questionnaireResponse}
            fhirClient={launch.fhirClient}
            patient={launch.patient}
            user={launch.user}
          />
        </>
      ) : null}
    </>
  );
}

export default FormPreviewOperationButtons;
