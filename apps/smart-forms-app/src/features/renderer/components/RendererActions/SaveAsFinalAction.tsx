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
import { useQuestionnaireResponseStore } from '@aehrc/smart-forms-renderer';
import useSmartClient from '../../../../hooks/useSmartClient.ts';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { useState } from 'react';
import RendererSaveAsFinalDialog from './RendererSaveAsFinalDialog.tsx';
import RendererOperationItem from '../RendererNav/RendererOperationItem.tsx';
import { useExtractOperationStore } from '../../../playground/stores/extractOperationStore.ts';
import RendererSaveAsFinalWriteBackDialog from './RendererSaveAsFinalWriteBackDialog.tsx';

interface SaveAsFinalActionProps extends SpeedDialActionProps {
  isSpeedDial?: boolean;
  onClose?: () => void;
}

function SaveAsFinalAction(props: SaveAsFinalActionProps) {
  const { isSpeedDial, onClose, ...speedDialActionProps } = props;

  const { smartClient } = useSmartClient();

  const [saveAsFinalDialogOpen, setSaveAsFinalDialogOpen] = useState(false);

  const updatableResponse = useQuestionnaireResponseStore.use.updatableResponse();
  const formChangesHistory = useQuestionnaireResponseStore.use.formChangesHistory();

  const targetStructureMap = useExtractOperationStore.use.targetStructureMap();

  function handleOpenDialog() {
    if (onClose) {
      onClose();
    }

    if (smartClient) {
      setSaveAsFinalDialogOpen(true);
    }
  }

  const responseWasSaved = !!updatableResponse.authored && !!updatableResponse.author;
  const buttonIsDisabled = !responseWasSaved && formChangesHistory.length === 0;

  const writeBackEnabled = !!targetStructureMap;

  return (
    <>
      {isSpeedDial ? (
        <SpeedDialAction
          icon={<TaskAltIcon />}
          tooltipTitle={`Save as Final ${writeBackEnabled ? '& Write Back' : ''}`}
          tooltipOpen
          onClick={handleOpenDialog}
          {...speedDialActionProps}
        />
      ) : (
        <RendererOperationItem
          title={`Save as Final ${writeBackEnabled ? '& Write Back' : ''}`}
          icon={<TaskAltIcon />}
          disabled={buttonIsDisabled}
          onClick={handleOpenDialog}
        />
      )}
      {writeBackEnabled ? (
        <RendererSaveAsFinalWriteBackDialog
          open={saveAsFinalDialogOpen}
          closeDialog={() => setSaveAsFinalDialogOpen(false)}
        />
      ) : (
        <RendererSaveAsFinalDialog
          open={saveAsFinalDialogOpen}
          closeDialog={() => setSaveAsFinalDialogOpen(false)}
        />
      )}
    </>
  );
}

export default SaveAsFinalAction;
