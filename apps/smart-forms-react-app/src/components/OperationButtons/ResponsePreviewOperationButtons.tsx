import React, { useContext } from 'react';
import BackToPickerButton from './SingleButtons/BackToPickerButton';
import EditResponseButton from './SingleButtons/EditResponseButton';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../App';
import SaveAsFinalButton from './SingleButtons/SaveAsFinalButton';
import { QuestionnaireSource } from '../../interfaces/Enums';
import { LaunchContext } from '../../custom-contexts/LaunchContext';

interface Props {
  isChip?: boolean;
}

function ResponsePreviewOperationButtons(props: Props) {
  const { isChip } = props;
  const questionnaireResponseProvider = useContext(QuestionnaireResponseProviderContext);
  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const launch = useContext(LaunchContext);
  return (
    <>
      <BackToPickerButton isChip={isChip} />
      {questionnaireResponseProvider.questionnaireResponse.status === 'completed' ? null : (
        <EditResponseButton isChip={isChip} />
      )}

      {launch.fhirClient &&
      launch.user &&
      launch.patient &&
      questionnaireProvider.source === QuestionnaireSource.Remote &&
      questionnaireResponseProvider.questionnaireResponse.status !== 'completed' ? (
        <SaveAsFinalButton
          isChip={isChip}
          questionnaireResponse={questionnaireResponseProvider.questionnaireResponse}
          fhirClient={launch.fhirClient}
          patient={launch.patient}
          user={launch.user}
          removeQrHasChanges={() => ({})}
        />
      ) : null}
    </>
  );
}

export default ResponsePreviewOperationButtons;
