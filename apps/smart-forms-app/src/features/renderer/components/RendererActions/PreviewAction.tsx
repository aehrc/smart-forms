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

import type { SpeedDialActionProps } from '@mui/material';
import { SpeedDialAction } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RendererOperationItem from '../RendererNav/RendererOperationItem.tsx';

interface PreviewSpeedDiaActionProps extends SpeedDialActionProps {
  isSpeedDial?: boolean;
}

function PreviewAction(props: PreviewSpeedDiaActionProps) {
  const { isSpeedDial, ...speedDialActionProps } = props;

  const { closeSnackbar } = useSnackbar();

  const navigate = useNavigate();

  function handleNavigatePreview() {
    closeSnackbar();
    navigate('/renderer/preview');
  }

  function handleNavigateRenderer() {
    closeSnackbar();
    navigate('/renderer');
  }

  if (isSpeedDial) {
    if (location.pathname === '/renderer') {
      return (
        <SpeedDialAction
          icon={<VisibilityIcon />}
          tooltipTitle="Preview"
          tooltipOpen
          onClick={handleNavigatePreview}
          {...speedDialActionProps}
        />
      );
    }

    return (
      <SpeedDialAction
        icon={<EditIcon />}
        tooltipTitle="Editor"
        tooltipOpen
        onClick={handleNavigateRenderer}
        {...speedDialActionProps}
      />
    );
  }

  if (location.pathname === '/renderer') {
    return (
      <RendererOperationItem
        title="Preview"
        icon={<VisibilityIcon />}
        onClick={handleNavigatePreview}
      />
    );
  }

  // location pathname is /renderer/preview
  return (
    <RendererOperationItem title="Editor" icon={<EditIcon />} onClick={handleNavigateRenderer} />
  );
}

export default PreviewAction;
