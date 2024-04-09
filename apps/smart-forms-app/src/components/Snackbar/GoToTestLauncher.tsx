/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { IconButton, Tooltip } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from 'notistack';

function GotoTestLauncher() {
  const originUrl = encodeURIComponent(window.location.origin);
  const launcherUrl = `https://launch.smarthealthit.org/?auth_error=&fhir_version_1=r4&fhir_version_2=r4&iss=&launch_ehr=1&launch_url=${originUrl}%2Flaunch`;

  const { closeSnackbar } = useSnackbar();

  function handleClick() {
    window.open(launcherUrl);
  }

  return (
    <>
      <Tooltip title="Close">
        <IconButton
          onClick={() => {
            closeSnackbar();
          }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Open CMS">
        <IconButton onClick={handleClick}>
          <OpenInNewIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </>
  );
}

export default GotoTestLauncher;
