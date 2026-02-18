/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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
import { CircularProgress, SpeedDialAction } from '@mui/material';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import RendererOperationItem from '../RendererNav/RendererOperationItem.tsx';

interface SaveAsFinalActionButtonProps extends SpeedDialActionProps {
  isSpeedDial: boolean;
  isExtracting: boolean;
  isDisabled: boolean;
  isAmendment: boolean;
  writeBackEnabled: boolean;
  onSaveAsFinalActionClick: () => void;
}

function SaveAsFinalActionButton(props: SaveAsFinalActionButtonProps) {
  const {
    isSpeedDial,
    isExtracting,
    isDisabled,
    isAmendment,
    writeBackEnabled,
    onSaveAsFinalActionClick,
    ...speedDialActionProps
  } = props;

  const actionTitle = `Save as ${isAmendment ? 'Amendment' : 'Final'} ${writeBackEnabled ? '& Write Back' : ''}`;

  // SpeedDial
  if (isSpeedDial) {
    return (
      <SpeedDialAction
        icon={<TaskAltIcon />}
        onClick={onSaveAsFinalActionClick}
        {...speedDialActionProps}
        slotProps={{
          tooltip: {
            title: actionTitle,
            open: true
          }
        }}
      />
    );
  }

  // Operation button on the left sidebar
  return (
    <RendererOperationItem
      title={actionTitle}
      icon={isExtracting ? <CircularProgress size={18} color="inherit" /> : <TaskAltIcon />}
      disabled={isDisabled || isExtracting}
      onClick={onSaveAsFinalActionClick}
    />
  );
}

export default SaveAsFinalActionButton;
