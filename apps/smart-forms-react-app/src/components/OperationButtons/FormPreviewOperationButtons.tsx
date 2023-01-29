import React, { useContext } from 'react';
import ChangeQuestionnaireButton from './SingleButtons/ChangeQuestionnaireButton';
import SaveAsDraftButton from './SingleButtons/SaveAsDraftButton';
import SaveAsFinalButton from './SingleButtons/SaveAsFinalButton';
import { QuestionnaireResponse } from 'fhir/r5';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import ContinueEditingButton from './SingleButtons/ContinueEditingButton';
import { QuestionnaireSource } from '../../interfaces/Enums';
import { QuestionnaireProviderContext } from '../../App';

interface Props {
  isChip?: boolean;
  qrHasChanges: boolean;
  removeQrHasChanges: () => unknown;
  togglePreviewMode: () => unknown;
  questionnaireResponse: QuestionnaireResponse;
}

function FormPreviewOperationButtons(props: Props) {
  const { isChip, qrHasChanges, removeQrHasChanges, togglePreviewMode, questionnaireResponse } =
    props;

  const launch = useContext(LaunchContext);
  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  return (
    <>
      <ChangeQuestionnaireButton
        isChip={isChip}
        qrHasChanges={qrHasChanges}
        removeQrHasChanges={removeQrHasChanges}
        questionnaireResponse={questionnaireResponse}
      />
      <ContinueEditingButton isChip={isChip} togglePreviewMode={togglePreviewMode} />
      {launch.fhirClient &&
      launch.user &&
      launch.patient &&
      questionnaireProvider.source === QuestionnaireSource.Remote ? (
        <>
          <SaveAsDraftButton
            isChip={isChip}
            qrHasChanges={qrHasChanges}
            removeQrHasChanges={removeQrHasChanges}
            questionnaireResponse={questionnaireResponse}
            fhirClient={launch.fhirClient}
            patient={launch.patient}
            user={launch.user}
          />
          <SaveAsFinalButton
            isChip={isChip}
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
