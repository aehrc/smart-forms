import { IconButton } from '@mui/material';
import React from 'react';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

function GotoTestLauncher() {
  const originUrl = encodeURIComponent(window.location.origin);
  const launcherUrl = `https://launch.smarthealthit.org/?auth_error=&fhir_version_1=r4&fhir_version_2=r4&iss=&launch_ehr=1&launch_url=${originUrl}%2Flaunch`;

  return (
    <IconButton
      onClick={() => {
        window.open(launcherUrl);
      }}>
      <OpenInNewIcon fontSize="small" />
    </IconButton>
  );
}

export default GotoTestLauncher;
