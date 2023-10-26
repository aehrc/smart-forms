/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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
import { SpeedDialAction, Tooltip } from '@mui/material';
import { useQuestionnaireResponseStore } from '@aehrc/smart-forms-renderer';
import useSmartClient from '../../../../hooks/useSmartClient.ts';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { useState } from 'react';
import RendererSaveAsFinalDialog from '../RendererNav/SaveAsFinal/RendererSaveAsFinalDialog.tsx';
import { RendererOperationItem } from '../RendererNav/RendererOperationSection.tsx';

interface SaveAsFinalActionProps extends SpeedDialActionProps {
  isSpeedDial?: boolean;
}

function SaveAsFinalAction(props: SaveAsFinalActionProps) {
  const { isSpeedDial } = props;

  const { smartClient } = useSmartClient();

  const [saveAsFinalDialogOpen, setSaveAsFinalDialogOpen] = useState(false);

  const updatableResponse = useQuestionnaireResponseStore((state) => state.updatableResponse);
  const formChangesHistory = useQuestionnaireResponseStore((state) => state.formChangesHistory);

  function handleOpenDialog() {
    if (smartClient) {
      setSaveAsFinalDialogOpen(true);
    }
  }

  const responseWasSaved = !!updatableResponse.authored && !!updatableResponse.author;
  const buttonIsDisabled = !responseWasSaved && formChangesHistory.length === 0;

  return (
    <>
      {isSpeedDial ? (
        <SpeedDialAction
          icon={<TaskAltIcon />}
          tooltipTitle="Save as Final"
          tooltipOpen
          onClick={handleOpenDialog}
          {...props}
        />
      ) : (
        <Tooltip title="No progress to be saved" disableHoverListener={!buttonIsDisabled}>
          <span>
            <RendererOperationItem
              title="Save as Final"
              icon={<TaskAltIcon />}
              disabled={buttonIsDisabled}
              onClick={handleOpenDialog}
            />
          </span>
        </Tooltip>
      )}
      <RendererSaveAsFinalDialog
        open={saveAsFinalDialogOpen}
        closeDialog={() => setSaveAsFinalDialogOpen(false)}
      />
    </>
  );
}

export default SaveAsFinalAction;
