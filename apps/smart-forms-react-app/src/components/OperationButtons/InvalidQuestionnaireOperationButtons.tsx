import React from 'react';
import ChangeQuestionnaireButton from './SingleButtons/ChangeQuestionnaireButton';
import { QuestionnaireResponse } from 'fhir/r5';

interface Props {
  isChip?: boolean;
  qrHasChanges: boolean;
  removeQrHasChanges: () => unknown;
  questionnaireResponse: QuestionnaireResponse;
}

function InvalidQuestionnaireOperationButtons(props: Props) {
  const { isChip, qrHasChanges, removeQrHasChanges, questionnaireResponse } = props;

  return (
    <>
      <ChangeQuestionnaireButton
        isChip={isChip}
        qrHasChanges={qrHasChanges}
        removeQrHasChanges={removeQrHasChanges}
        questionnaireResponse={questionnaireResponse}
      />
    </>
  );
}

export default InvalidQuestionnaireOperationButtons;
