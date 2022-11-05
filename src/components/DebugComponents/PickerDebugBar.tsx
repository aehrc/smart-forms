import React from 'react';
import { FormControlLabel, Switch } from '@mui/material';
import { DebugBarContainerBox } from './DebugBar.styles';

type Props = {
  questionnaireIsSearching: boolean;
  questionnaireSourceIsLocal: boolean;
  toggleQuestionnaireSource: () => unknown;
};

function PickerDebugBar(props: Props) {
  const { questionnaireIsSearching, questionnaireSourceIsLocal, toggleQuestionnaireSource } = props;
  return (
    <DebugBarContainerBox>
      <FormControlLabel
        control={
          <Switch
            disabled={questionnaireIsSearching}
            checked={questionnaireSourceIsLocal}
            onChange={() => toggleQuestionnaireSource()}
          />
        }
        label={questionnaireSourceIsLocal ? 'Local' : 'Remote'}
      />
    </DebugBarContainerBox>
  );
}

export default PickerDebugBar;
