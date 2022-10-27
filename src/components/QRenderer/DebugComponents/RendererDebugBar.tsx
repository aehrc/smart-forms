import React from 'react';
import { FormControlLabel, Switch, Typography } from '@mui/material';
import { DebugBarContainerBox } from './DebugBar.styles';

type Props = {
  hideQResponse: boolean;
  toggleHideQResponse: (checked: boolean) => unknown;
  enableWhenStatus: boolean;
  toggleEnableWhenStatus: (checked: boolean) => unknown;
};

function RendererDebugBar(props: Props) {
  const { hideQResponse, toggleHideQResponse, enableWhenStatus, toggleEnableWhenStatus } = props;
  return (
    <>
      <DebugBarContainerBox>
        <FormControlLabel
          control={
            <Switch
              onChange={(event) => toggleHideQResponse(event.target.checked)}
              checked={hideQResponse}
            />
          }
          label={<Typography variant="subtitle2">Hide Debug QResponse</Typography>}
        />
        <FormControlLabel
          control={
            <Switch
              onChange={(event) => toggleEnableWhenStatus(event.target.checked)}
              checked={enableWhenStatus}
            />
          }
          label={<Typography variant="subtitle2">EnableWhen checks</Typography>}
        />
      </DebugBarContainerBox>
    </>
  );
}

export default RendererDebugBar;
