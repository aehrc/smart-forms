import React from 'react';
import ChangeQuestionnaireButton from './SingleButtons/ChangeQuestionnaireButton';

interface Props {
  isChip?: boolean;
}
function InvalidQuestionnaireOperationButtons(props: Props) {
  const { isChip } = props;
  return (
    <>
      <ChangeQuestionnaireButton isChip={isChip} />
    </>
  );
}

export default InvalidQuestionnaireOperationButtons;
