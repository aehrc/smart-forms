import React from 'react';
import { Operation } from '../../interfaces/Enums';
import BackToPickerButton from '../OperationButtons/BackToPickerButton';
import PrintPreviewButton from '../OperationButtons/PrintPreviewButton';
import EditResponseButton from '../OperationButtons/EditResponseButton';

interface Props {
  buttonOrChip: Operation;
}

function ResponsePreviewOperationButtons(props: Props) {
  const { buttonOrChip } = props;
  return (
    <>
      <BackToPickerButton buttonOrChip={buttonOrChip} />
      <PrintPreviewButton buttonOrChip={buttonOrChip} />
      <EditResponseButton buttonOrChip={buttonOrChip} />
    </>
  );
}

export default ResponsePreviewOperationButtons;
