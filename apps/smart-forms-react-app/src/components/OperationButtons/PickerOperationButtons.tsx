import React from 'react';
import RefreshQuestionnaireListButton from './SingleButtons/RefreshQuestionnaireListButton';

interface Props {
  isChip: boolean;
  refreshQuestionnaireList: () => unknown;
}

function PickerOperationButtons(props: Props) {
  const { isChip, refreshQuestionnaireList } = props;

  return (
    <RefreshQuestionnaireListButton
      isChip={isChip}
      refreshQuestionnaireList={refreshQuestionnaireList}
    />
  );
}

export default PickerOperationButtons;
