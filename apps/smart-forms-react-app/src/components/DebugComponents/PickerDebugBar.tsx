import React, { useContext } from 'react';
import { FormControlLabel, Switch } from '@mui/material';
import { DebugBarContainerBox } from './DebugBar.styles';
import { LaunchContext } from '../../custom-contexts/LaunchContext';

type Props = {
  questionnaireIsSearching: boolean;
  questionnaireSourceIsLocal: boolean;
  toggleQuestionnaireSource: () => unknown;
};

function PickerDebugBar(props: Props) {
  const { questionnaireIsSearching, questionnaireSourceIsLocal, toggleQuestionnaireSource } = props;

  const launch = useContext(LaunchContext);
  return (
    <DebugBarContainerBox>
      <FormControlLabel
        control={
          <Switch
            disabled={questionnaireIsSearching || launch.fhirClient === null}
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
