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

import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { useState } from 'react';
import ViewerOperationItem from '../ViewerOperationItem.tsx';
import ViewerSaveAsFinalDialog from './ViewerSaveAsFinalDialog.tsx';
import useSmartClient from '../../../../hooks/useSmartClient.ts';

function ViewerSaveAsFinal() {
  const { smartClient } = useSmartClient();

  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <ViewerOperationItem
        title="Save as Final"
        icon={<TaskAltIcon />}
        onClick={() => {
          if (smartClient) {
            setDialogOpen(true);
          }
        }}
      />
      <ViewerSaveAsFinalDialog open={dialogOpen} closeDialog={() => setDialogOpen(false)} />
    </>
  );
}

export default ViewerSaveAsFinal;
