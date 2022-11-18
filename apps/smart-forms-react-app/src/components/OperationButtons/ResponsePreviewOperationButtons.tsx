import React, { useContext } from 'react';
import BackToPickerButton from './SingleButtons/BackToPickerButton';
import EditResponseButton from './SingleButtons/EditResponseButton';
import { QuestionnaireResponseProviderContext } from '../../App';

interface Props {
  isChip?: boolean;
}

function ResponsePreviewOperationButtons(props: Props) {
  const { isChip } = props;
  const questionnaireProvider = useContext(QuestionnaireResponseProviderContext);
  return (
    <>
      <BackToPickerButton isChip={isChip} />
      {questionnaireProvider.questionnaireResponse.status === 'completed' ? null : (
        <EditResponseButton isChip={isChip} />
      )}
    </>
  );
}

export default ResponsePreviewOperationButtons;
