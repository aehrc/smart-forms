import React from 'react';
import ChangeQuestionnaireButton from './SingleButtons/ChangeQuestionnaireButton';
import SaveAsDraftButton from './SingleButtons/SaveAsDraftButton';
import SaveAsFinalButton from './SingleButtons/SaveAsFinalButton';
import { QuestionnaireResponse } from 'fhir/r5';
import { LaunchContext } from '../../custom-contexts/LaunchContext';
import ViewFormPreviewButton from './SingleButtons/ViewFormPreviewButton';
import { QuestionnaireProviderContext } from '../../App';
import { QuestionnaireSource } from '../../interfaces/Enums';

interface Props {
  isChip?: boolean;
  qrHasChanges: boolean;
  removeQrHasChanges: () => unknown;
  togglePreviewMode: () => unknown;
  questionnaireResponse: QuestionnaireResponse;
}

function RendererOperationButtons(props: Props) {
  const { isChip, qrHasChanges, removeQrHasChanges, togglePreviewMode, questionnaireResponse } =
    props;

  const launch = React.useContext(LaunchContext);
  const questionnaireProvider = React.useContext(QuestionnaireProviderContext);
  return (
    <>
      <ChangeQuestionnaireButton
        isChip={isChip}
        qrHasChanges={qrHasChanges}
        removeQrHasChanges={removeQrHasChanges}
        questionnaireResponse={questionnaireResponse}
      />
      <ViewFormPreviewButton isChip={isChip} togglePreviewMode={togglePreviewMode} />
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

export default RendererOperationButtons;
