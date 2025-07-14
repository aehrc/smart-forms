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

import React, { useState } from 'react';
import type {
  PropsWithItemPathAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithParentIsRepeatGroupAttribute,
  PropsWithParentStylesAttribute,
  PropsWithQrRepeatGroupChangeHandler,
  PropsWithShowMinimalViewAttribute
} from '../../../interfaces/renderProps.interface';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import useInitialiseRepeatGroups from '../../../hooks/useInitialiseRepeatGroups';
import { useQuestionnaireStore } from '../../../stores';
import RepeatGroupView from './RepeatGroupView';
import { generateNewRepeatId } from '../../../utils/repeatId';
import type { ItemPath } from '../../../interfaces/itemPath.interface';

interface RepeatGroupProps
  extends PropsWithQrRepeatGroupChangeHandler,
    PropsWithItemPathAttribute,
    PropsWithShowMinimalViewAttribute,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithParentIsRepeatGroupAttribute,
    PropsWithParentStylesAttribute {
  qItem: QuestionnaireItem;
  qrItems: QuestionnaireResponseItem[];
  groupCardElevation: number;
}

/**
 * Main component to render a repeating, group Questionnaire item.
 * Store and manages the state of multiple instances of GroupItem in a repeating group.
 *
 * @author Sean Fong
 */
function RepeatGroup(props: RepeatGroupProps) {
  const {
    qItem,
    qrItems,
    itemPath,
    groupCardElevation,
    showMinimalView,
    parentIsReadOnly,
    onQrRepeatGroupChange,
    parentStyles
  } = props;

  const mutateRepeatEnableWhenItems = useQuestionnaireStore.use.mutateRepeatEnableWhenItems();

  const initialRepeatGroups = useInitialiseRepeatGroups(qItem.linkId, qrItems);

  const [repeatGroups, setRepeatGroups] = useState(initialRepeatGroups);

  function handleAnswerChange(
    newQrItem: QuestionnaireResponseItem,
    index: number,
    targetItemPath?: ItemPath
  ) {
    const updatedRepeatGroups = [...repeatGroups];

    if (newQrItem.item) {
      updatedRepeatGroups[index].qrItem = {
        linkId: newQrItem.linkId,
        text: newQrItem.text,
        item: newQrItem.item
      };
    }

    setRepeatGroups(updatedRepeatGroups);

    // Include targetItemPath because an answer is changed
    onQrRepeatGroupChange(
      {
        linkId: qItem.linkId,
        qrItems: updatedRepeatGroups.flatMap((singleGroup) =>
          singleGroup.qrItem ? [structuredClone(singleGroup.qrItem)] : []
        )
      },
      targetItemPath
    );
  }

  function handleRemoveItem(index: number) {
    const updatedRepeatGroups = [...repeatGroups];
    updatedRepeatGroups.splice(index, 1);

    const newLastItemIndex = repeatGroups.length;
    mutateRepeatEnableWhenItems(qItem.linkId, newLastItemIndex, 'remove');

    setRepeatGroups(updatedRepeatGroups);

    // Don't need to include targetItemPath because we are deleting the whole QRItem, only include targetItemPath if an answer is changed
    onQrRepeatGroupChange({
      linkId: qItem.linkId,
      qrItems: updatedRepeatGroups.flatMap((singleGroup) =>
        singleGroup.qrItem ? [structuredClone(singleGroup.qrItem)] : []
      )
    });
  }

  function handleAddItem() {
    const newLastItemIndex = repeatGroups.length;
    mutateRepeatEnableWhenItems(qItem.linkId, newLastItemIndex, 'add');
    setRepeatGroups([
      ...repeatGroups,
      {
        id: generateNewRepeatId(qItem.linkId),
        qrItem: null
      }
    ]);
  }

  return (
    <RepeatGroupView
      qItem={qItem}
      repeatGroups={repeatGroups}
      itemPath={itemPath}
      groupCardElevation={groupCardElevation}
      showMinimalView={showMinimalView}
      parentIsReadOnly={parentIsReadOnly}
      onAnswerChange={handleAnswerChange}
      onAddItem={handleAddItem}
      onRemoveItem={handleRemoveItem}
      parentStyles={parentStyles}
    />
  );
}

export default RepeatGroup;
