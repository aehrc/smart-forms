import React from 'react';
import { FormControlLabel, Switch } from '@mui/material';
import { DebugBarContainerBox } from './DebugBar.styles';

type Props = {
  qIsSearching: boolean;
  qHostingIsLocal: boolean;
  setQHostingIsLocal: React.Dispatch<React.SetStateAction<boolean>>;
};

function PickerDebugBar(props: Props) {
  const { qIsSearching, qHostingIsLocal, setQHostingIsLocal } = props;
  return (
    <>
      <DebugBarContainerBox>
        <FormControlLabel
          control={
            <Switch
              disabled={qIsSearching}
              checked={qHostingIsLocal}
              onChange={() => setQHostingIsLocal(!qHostingIsLocal)}
            />
          }
          label={qHostingIsLocal ? 'Local' : 'Remote'}
        />
      </DebugBarContainerBox>
    </>
  );
}

export default PickerDebugBar;
