import React from 'react';
import { Operation } from '../../interfaces/Enums';
import RefreshQuestionnaireListButton from './SingleButtons/RefreshQuestionnaireListButton';

interface Props {
  buttonOrChip: Operation;
  refreshQuestionnaireList: () => unknown;
}

function PickerOperationButtons(props: Props) {
  const { buttonOrChip, refreshQuestionnaireList } = props;

  return (
    <RefreshQuestionnaireListButton
      buttonOrChip={buttonOrChip}
      refreshQuestionnaireList={refreshQuestionnaireList}
    />
  );
}

export default PickerOperationButtons;
