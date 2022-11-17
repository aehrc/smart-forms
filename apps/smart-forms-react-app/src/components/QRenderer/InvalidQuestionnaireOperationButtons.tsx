import React from 'react';
import ChangeQuestionnaireButton from '../OperationButtons/ChangeQuestionnaireButton';
import { Operation } from '../../interfaces/Enums';
import { QuestionnaireResponse } from 'fhir/r5';

interface Props {
  buttonOrChip: Operation;
  qrHasChanges: boolean;
  removeQrHasChanges: () => unknown;
  questionnaireResponse: QuestionnaireResponse;
}

function InvalidQuestionnaireOperationButtons(props: Props) {
  const { buttonOrChip, qrHasChanges, removeQrHasChanges, questionnaireResponse } = props;

  return (
    <>
      <ChangeQuestionnaireButton
        buttonOrChip={buttonOrChip}
        qrHasChanges={qrHasChanges}
        removeQrHasChanges={removeQrHasChanges}
        questionnaireResponse={questionnaireResponse}
      />
    </>
  );
}

export default InvalidQuestionnaireOperationButtons;
