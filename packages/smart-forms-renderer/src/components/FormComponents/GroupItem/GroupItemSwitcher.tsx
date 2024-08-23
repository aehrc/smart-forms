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

import React from 'react';
import type {
  PropsWithParentIsReadOnlyAttribute,
  PropsWithParentIsRepeatGroupAttribute,
  PropsWithQrItemChangeHandler,
  PropsWithQrRepeatGroupChangeHandler
} from '../../../interfaces/renderProps.interface';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { isRepeatItemAndNotCheckbox, isSpecificItemControl } from '../../../utils';
import GroupTable from '../Tables/GroupTable';
import RepeatGroup from '../RepeatGroup/RepeatGroup';
import RepeatItem from '../RepeatItem/RepeatItem';
import SingleItem from '../SingleItem/SingleItem';
import useHidden from '../../../hooks/useHidden';
import GroupItem from './GroupItem';
import GridGroup from '../GridGroup/GridGroup';

interface GroupItemSwitcherProps
  extends PropsWithQrItemChangeHandler,
    PropsWithQrRepeatGroupChangeHandler,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithParentIsRepeatGroupAttribute {
  qItem: QuestionnaireItem;
  qrItemOrItems: QuestionnaireResponseItem | QuestionnaireResponseItem[] | undefined;
  groupCardElevation: number;
}

function GroupItemSwitcher(props: GroupItemSwitcherProps) {
  const {
    qItem,
    qrItemOrItems,
    groupCardElevation,
    parentIsReadOnly,
    parentIsRepeatGroup,
    parentRepeatGroupIndex,
    onQrItemChange,
    onQrRepeatGroupChange
  } = props;

  const itemIsHidden = useHidden(qItem, parentRepeatGroupIndex);
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
        <GroupTable
          qItem={qItem}
          qrItems={qrItems}
          groupCardElevation={groupCardElevation + 1}
          isRepeated={true}
          parentIsReadOnly={parentIsReadOnly}
          onQrRepeatGroupChange={onQrRepeatGroupChange}
        />
      );
    }

    return (
      <RepeatGroup
        qItem={qItem}
        qrItems={qrItems}
        groupCardElevation={groupCardElevation + 1}
        parentIsReadOnly={parentIsReadOnly}
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
        qrItem={qrItem ?? null}
        groupCardElevation={groupCardElevation}
        parentIsReadOnly={parentIsReadOnly}
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
          <GroupTable
            qItem={qItem}
            qrItems={[]}
            groupCardElevation={groupCardElevation + 1}
            isRepeated={true}
            parentIsReadOnly={parentIsReadOnly}
            onQrRepeatGroupChange={onQrRepeatGroupChange}
          />
        );
      }

      return (
        <RepeatGroup
          qItem={qItem}
          qrItems={[]}
          groupCardElevation={groupCardElevation + 1}
          parentIsReadOnly={parentIsReadOnly}
          onQrRepeatGroupChange={onQrRepeatGroupChange}
        />
      );
    }

    return (
      <RepeatItem
        qItem={qItem}
        qrItem={qrItem ?? null}
        groupCardElevation={groupCardElevation + 1}
        parentIsReadOnly={parentIsReadOnly}
        onQrItemChange={onQrItemChange}
      />
    );
  }

  // if qItem is not a repeating question or is a checkbox
  if (qItem.type === 'group') {
    // GroupTable "gtable" can be rendered with either repeats:true or false
    if (isSpecificItemControl(qItem, 'gtable')) {
      return (
        <GroupTable
          qItem={qItem}
          qrItems={qrItem ? [qrItem] : []}
          groupCardElevation={groupCardElevation + 1}
          isRepeated={false}
          parentIsReadOnly={parentIsReadOnly}
          onQrRepeatGroupChange={onQrRepeatGroupChange}
        />
      );
    }

    return (
      <GroupItem
        qItem={qItem}
        qrItem={qrItem ?? null}
        isRepeated={false}
        groupCardElevation={groupCardElevation + 1}
        parentIsReadOnly={parentIsReadOnly}
        parentIsRepeatGroup={parentIsRepeatGroup}
        parentRepeatGroupIndex={parentRepeatGroupIndex}
        onQrItemChange={onQrItemChange}
      />
    );
  }

  // Defaults to a single, non-group item
  return (
    <SingleItem
      qItem={qItem}
      qrItem={qrItem ?? null}
      isRepeated={false}
      isTabled={false}
      groupCardElevation={groupCardElevation + 1}
      parentIsReadOnly={parentIsReadOnly}
      parentIsRepeatGroup={parentIsRepeatGroup}
      parentRepeatGroupIndex={parentRepeatGroupIndex}
      onQrItemChange={onQrItemChange}
    />
  );
}

export default GroupItemSwitcher;
