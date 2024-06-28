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

import RepopulateEmptyDialog from './RepopulateEmptyDialog.tsx';
import RepopulateSelectDialog from './RepopulateSelectDialog.tsx';
import type { RendererSpinner } from '../../renderer/types/rendererSpinner.ts';
import { useRepopulationStore } from '../stores/RepopulationStore.ts';

interface RepopulateDialogProps {
  repopulateFetchingEnded: boolean;
  onCloseDialog: () => void;
  onSpinnerChange: (newSpinner: RendererSpinner) => void;
}

function RepopulateDialog(props: RepopulateDialogProps) {
  const { repopulateFetchingEnded, onCloseDialog, onSpinnerChange } = props;

  const itemsToRepopulate = useRepopulationStore.use.itemsToRepopulate();

  if (!repopulateFetchingEnded) {
    return null;
  }

  const itemsToRepopulateEmpty = Object.keys(itemsToRepopulate).length === 0;

  if (!itemsToRepopulate || itemsToRepopulateEmpty) {
    return <RepopulateEmptyDialog onCloseDialog={onCloseDialog} />;
  }

  return (
    <RepopulateSelectDialog
      itemsToRepopulate={itemsToRepopulate}
      onCloseDialog={onCloseDialog}
      onSpinnerChange={onSpinnerChange}
    />
  );
}

export default RepopulateDialog;
