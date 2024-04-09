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

import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import RepopulateSingleItem from './RepopulateSingleItem.tsx';
import RepopulateGroupTable from './RepopulateGroupTable.tsx';
import { isRepeatItemAndNotCheckbox, isSpecificItemControl } from '@aehrc/smart-forms-renderer';
import RepopulateRepeatItem from './RepopulateRepeatItem.tsx';
import RepopulateRepeatGroup from './RepopulateRepeatGroup.tsx';
import RepopulateGridGroup from './RepopulateGridGroup.tsx';

interface RepopulateItemSwitcherProps {
  qItem: QuestionnaireItem;
  newQRItem: QuestionnaireResponseItem;
  oldQRItem?: QuestionnaireResponseItem;
  newQRItems: QuestionnaireResponseItem[];
  oldQRItems?: QuestionnaireResponseItem[];
}

function RepopulateItemSwitcher(props: RepopulateItemSwitcherProps) {
  const { qItem, oldQRItem, newQRItem, newQRItems, oldQRItems } = props;

  if (qItem.type === 'group' && qItem.repeats && isSpecificItemControl(qItem, 'gtable')) {
    return <RepopulateGroupTable qItem={qItem} newQRItems={newQRItems} oldQRItems={oldQRItems} />;
  }

  // normal repeat group
  if (qItem.type === 'group' && qItem.repeats) {
    return <RepopulateRepeatGroup qItem={qItem} newQRItems={newQRItems} oldQRItems={oldQRItems} />;
  }

  if (isSpecificItemControl(qItem, 'grid')) {
    return <RepopulateGridGroup qItem={qItem} newQRItem={newQRItem} oldQRItem={oldQRItem} />;
  }

  // non-checkbox repeat items
  const itemRepeatsAndIsNotCheckbox = isRepeatItemAndNotCheckbox(qItem);
  if (itemRepeatsAndIsNotCheckbox) {
    return <RepopulateRepeatItem qItem={qItem} newQRItem={newQRItem} oldQRItem={oldQRItem} />;
  }

  return <RepopulateSingleItem qItem={qItem} oldQRItem={oldQRItem} newQRItem={newQRItem} />;
}

export default RepopulateItemSwitcher;
