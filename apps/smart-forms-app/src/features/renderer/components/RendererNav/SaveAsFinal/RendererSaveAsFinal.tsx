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

import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { useEffect, useState } from 'react';
import { RendererOperationItem } from '../RendererOperationSection.tsx';
import RendererSaveAsFinalDialog from './RendererSaveAsFinalDialog.tsx';
import useConfigStore from '../../../../../stores/useConfigStore.ts';
import { useFormHasChanges, useUpdatableResponse } from '@aehrc/smart-forms-renderer';

function RendererSaveAsFinal() {
  const smartClient = useConfigStore((state) => state.smartClient);

  const updatableResponse = useUpdatableResponse();
  const hasChanges = useFormHasChanges();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
    }, 800);
  }, [updatableResponse]);

  const responseWasSaved: boolean = !!updatableResponse.authored && !!updatableResponse.author;
  const buttonIsDisabled = (!hasChanges && !responseWasSaved) || isUpdating;

  return (
    <>
      <RendererOperationItem
        title="Save as Final"
        icon={<TaskAltIcon />}
        disabled={buttonIsDisabled}
        onClick={() => {
          if (smartClient) {
            setDialogOpen(true);
          }
        }}
      />
      <RendererSaveAsFinalDialog open={dialogOpen} closeDialog={() => setDialogOpen(false)} />
    </>
  );
}

export default RendererSaveAsFinal;
