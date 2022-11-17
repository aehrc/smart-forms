import React, { useContext } from 'react';
import { Operation } from '../../interfaces/Enums';
import BackToPickerButton from './SingleButtons/BackToPickerButton';
import PrintPreviewButton from './SingleButtons/PrintPreviewButton';
import EditResponseButton from './SingleButtons/EditResponseButton';
import { QuestionnaireResponseProviderContext } from '../../App';

interface Props {
  buttonOrChip: Operation;
}

function ResponsePreviewOperationButtons(props: Props) {
  const { buttonOrChip } = props;
  const questionnaireProvider = useContext(QuestionnaireResponseProviderContext);
  return (
    <>
      <BackToPickerButton buttonOrChip={buttonOrChip} />
      <PrintPreviewButton buttonOrChip={buttonOrChip} />
      {questionnaireProvider.questionnaireResponse.status === 'completed' ? null : (
        <EditResponseButton buttonOrChip={buttonOrChip} />
      )}
    </>
  );
}

export default ResponsePreviewOperationButtons;
