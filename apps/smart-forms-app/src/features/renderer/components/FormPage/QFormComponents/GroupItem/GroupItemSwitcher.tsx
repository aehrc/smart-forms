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

import type {
  PropsWithQrItemChangeHandler,
  PropsWithQrRepeatGroupChangeHandler
} from '../../../../types/renderProps.interface.ts';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { isSpecificItemControl } from '../../../../utils/itemControl.ts';
import QItemGroupTable from '../Tables/QItemGroupTable.tsx';
import RepeatGroup from '../RepeatGroup/RepeatGroup.tsx';
import { isRepeatItemAndNotCheckbox } from '../../../../utils/qItem.ts';
import RepeatItem from '../RepeatItem/RepeatItem.tsx';
import SingleItem from '../SingleItem/SingleItem.tsx';
import useHidden from '../../../../hooks/useHidden.ts';
import GroupItem from './GroupItem.tsx';
import GridGroup from '../GridGroup/GridGroup.tsx';

interface GroupItemSwitcherProps
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithQrRepeatGroupChangeHandler {
  qItem: QuestionnaireItem;
  qrItemOrItems: QuestionnaireResponseItem | QuestionnaireResponseItem[];
  groupCardElevation: number;
}

function GroupItemSwitcher(props: GroupItemSwitcherProps) {
  const { qItem, qrItemOrItems, groupCardElevation, onQrItemChange, onQrRepeatGroupChange } = props;

  const itemIsHidden = useHidden(qItem);
  if (itemIsHidden) {
    return null;
  }

  // If there are multiple answers
  const hasMultipleAnswers = Array.isArray(qrItemOrItems);
  if (hasMultipleAnswers) {
    const qrItems = qrItemOrItems;

    // qItem should always be either a repeatGroup or a groupTable item
    // groupTables item have qItem.repeats = true and qItem.type = 'group' as well
    if (!qItem.repeats || qItem.type !== 'group') {
      return <>Something went wrong here</>;
    }

    if (isSpecificItemControl(qItem, 'gtable')) {
      return (
        <QItemGroupTable
          qItem={qItem}
          qrItems={qrItems}
          groupCardElevation={groupCardElevation + 1}
          onQrRepeatGroupChange={onQrRepeatGroupChange}
        />
      );
    }

    return (
      <RepeatGroup
        qItem={qItem}
        qrItems={qrItems}
        groupCardElevation={groupCardElevation + 1}
        onQrRepeatGroupChange={onQrRepeatGroupChange}
      />
    );
  }

  // If there is only one answer
  const qrItem = qrItemOrItems;
  const itemIsGrid = isSpecificItemControl(qItem, 'grid');
  if (itemIsGrid) {
    return (
      <GridGroup
        qItem={qItem}
        qrItem={qrItem}
        groupCardElevation={groupCardElevation}
        onQrItemChange={onQrItemChange}
      />
    );
  }

  const itemRepeatsAndIsNotCheckbox = isRepeatItemAndNotCheckbox(qItem);
  if (itemRepeatsAndIsNotCheckbox) {
    if (qItem.type === 'group') {
      // If qItem is RepeatGroup or a groupTable item in this decision branch,
      // their qrItem array should always be empty
      if (isSpecificItemControl(qItem, 'gtable')) {
        return (
          <QItemGroupTable
            qItem={qItem}
            qrItems={[]}
            groupCardElevation={groupCardElevation + 1}
            onQrRepeatGroupChange={onQrRepeatGroupChange}
          />
        );
      }

      return (
        <RepeatGroup
          qItem={qItem}
          qrItems={[]}
          groupCardElevation={groupCardElevation + 1}
          onQrRepeatGroupChange={onQrRepeatGroupChange}
        />
      );
    }

    return <RepeatItem qItem={qItem} qrItem={qrItem} onQrItemChange={onQrItemChange} />;
  }

  // if qItem is not a repeating question or is a checkbox
  if (qItem.type === 'group') {
    return (
      <GroupItem
        qItem={qItem}
        qrItem={qrItem}
        isRepeated={false}
        groupCardElevation={groupCardElevation + 1}
        onQrItemChange={onQrItemChange}
      />
    );
  }

  // Defaults to a normal QItemSwitcher
  return (
    <SingleItem
      qItem={qItem}
      qrItem={qrItem}
      isRepeated={false}
      isTabled={false}
      onQrItemChange={onQrItemChange}
    />
  );
}

export default GroupItemSwitcher;
