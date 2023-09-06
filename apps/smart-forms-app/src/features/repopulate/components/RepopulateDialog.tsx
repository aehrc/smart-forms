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

import type { ItemToRepopulate } from '@aehrc/smart-forms-renderer';
import RepopulateEmptyDialog from './RepopulateEmptyDialog.tsx';
import RepopulateSelectDialog from './RepopulateSelectDialog.tsx';

interface RepopulateDialogProps {
  isRepopulated: boolean;
  repopulatedItems: Record<string, ItemToRepopulate>;
  onCloseDialog: () => void;
}

function RepopulateDialog(props: RepopulateDialogProps) {
  const { isRepopulated, repopulatedItems, onCloseDialog } = props;

  if (!isRepopulated) {
    return null;
  }

  const repopulateItemsEmpty = Object.keys(repopulatedItems).length === 0;

  if (!repopulatedItems || repopulateItemsEmpty) {
    return <RepopulateEmptyDialog onCloseDialog={onCloseDialog} />;
  }

  return (
    <RepopulateSelectDialog repopulatedItems={repopulatedItems} onCloseDialog={onCloseDialog} />
  );
}

export default RepopulateDialog;
