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
  PropsWithQrRepeatGroupChangeHandler,
  PropsWithShowMinimalViewAttribute
} from '../../../interfaces/renderProps.interface';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import useInitialiseRepeatGroups from '../../../hooks/useInitialiseRepeatGroups';
import { QGroupContainerBox } from '../../Box.styles';
import Card from '@mui/material/Card';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import { TransitionGroup } from 'react-transition-group';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { nanoid } from 'nanoid';
import RepeatGroupItem from './RepeatGroupItem';
import AddItemButton from './AddItemButton';
import LabelWrapper from '../ItemParts/ItemLabelWrapper';
import cloneDeep from 'lodash.clonedeep';
import useReadOnly from '../../../hooks/useReadOnly';
import Typography from '@mui/material/Typography';
import { useQuestionnaireStore } from '../../../stores';
import useRepeatGroups from '../../../hooks/useRepeatGroups';

interface RepeatGroupProps
  extends PropsWithQrRepeatGroupChangeHandler,
    PropsWithShowMinimalViewAttribute,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithParentIsRepeatGroupAttribute {
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
    groupCardElevation,
    showMinimalView,
    parentIsReadOnly,
    onQrRepeatGroupChange
  } = props;

  const mutateRepeatEnableWhenItems = useQuestionnaireStore.use.mutateRepeatEnableWhenItems();

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  const initialRepeatGroups = useInitialiseRepeatGroups(qItem, qrItems);

  const [repeatGroups, setRepeatGroups] = useRepeatGroups(initialRepeatGroups);

  function handleAnswerChange(newQrItem: QuestionnaireResponseItem, index: number) {
    const updatedRepeatGroups = [...repeatGroups];

    if (newQrItem.item) {
      updatedRepeatGroups[index].qrItem = {
        linkId: newQrItem.linkId,
        text: newQrItem.text,
        item: newQrItem.item
      };
    }

    setRepeatGroups(updatedRepeatGroups);
    onQrRepeatGroupChange({
      linkId: qItem.linkId,
      qrItems: updatedRepeatGroups.flatMap((singleGroup) =>
        singleGroup.qrItem ? [cloneDeep(singleGroup.qrItem)] : []
      )
    });
  }

  function handleDeleteItem(index: number) {
    const updatedRepeatGroups = [...repeatGroups];
    updatedRepeatGroups.splice(index, 1);

    const newLastItemIndex = repeatGroups.length;
    mutateRepeatEnableWhenItems(qItem.linkId, newLastItemIndex, 'remove');

    setRepeatGroups(updatedRepeatGroups);
    onQrRepeatGroupChange({
      linkId: qItem.linkId,
      qrItems: updatedRepeatGroups.flatMap((singleGroup) =>
        singleGroup.qrItem ? [cloneDeep(singleGroup.qrItem)] : []
      )
    });
  }

  function handleAddItem() {
    const newLastItemIndex = repeatGroups.length;
    mutateRepeatEnableWhenItems(qItem.linkId, newLastItemIndex, 'add');
    setRepeatGroups([
      ...repeatGroups,
      {
        nanoId: nanoid(),
        qrItem: null
      }
    ]);
  }

  if (showMinimalView) {
    return (
      <QGroupContainerBox key={qItem.linkId} cardElevation={groupCardElevation} isRepeated={true}>
        <Card elevation={groupCardElevation} sx={{ p: 2 }}>
          {repeatGroups.map(({ nanoId, qrItem: nullableQrItem }, index) => {
            const answeredQrItem = createEmptyQrItem(qItem);
            if (nullableQrItem) {
              answeredQrItem.item = nullableQrItem.item;
            }

            return (
              <RepeatGroupItem
                key={nanoId}
                qItem={qItem}
                repeatGroupIndex={index}
                answeredQrItem={answeredQrItem}
                nullableQrItem={nullableQrItem}
                numOfRepeatGroups={repeatGroups.length}
                groupCardElevation={groupCardElevation + 1}
                showMinimalView={showMinimalView}
                parentIsReadOnly={parentIsReadOnly}
                onDeleteItem={() => handleDeleteItem(index)}
                onQrItemChange={(newQrItem) => handleAnswerChange(newQrItem, index)}
              />
            );
          })}
        </Card>
      </QGroupContainerBox>
    );
  }

  return (
    <QGroupContainerBox key={qItem.linkId} cardElevation={groupCardElevation} isRepeated={true}>
      <Card elevation={groupCardElevation} sx={{ p: 3, py: 2.5, mb: 3.5 }}>
        {qItem.text ? (
          <>
            <Typography variant="h6" color={readOnly ? 'text.secondary' : 'text.primary'}>
              <LabelWrapper qItem={qItem} readOnly={readOnly} />
            </Typography>
            <Divider sx={{ mt: 1, mb: 1.5 }} light />
          </>
        ) : null}
        <TransitionGroup>
          {repeatGroups.map(({ nanoId, qrItem: nullableQrItem }, index) => {
            const answeredQrItem = createEmptyQrItem(qItem);
            if (nullableQrItem) {
              answeredQrItem.item = nullableQrItem.item;
            }

            return (
              <Collapse key={nanoId} timeout={200}>
                <RepeatGroupItem
                  qItem={qItem}
                  repeatGroupIndex={index}
                  answeredQrItem={answeredQrItem}
                  nullableQrItem={nullableQrItem}
                  numOfRepeatGroups={repeatGroups.length}
                  groupCardElevation={groupCardElevation + 1}
                  parentIsReadOnly={parentIsReadOnly}
                  onDeleteItem={() => handleDeleteItem(index)}
                  onQrItemChange={(newQrItem) => handleAnswerChange(newQrItem, index)}
                />
              </Collapse>
            );
          })}
        </TransitionGroup>

        <AddItemButton repeatGroups={repeatGroups} readOnly={readOnly} onAddItem={handleAddItem} />
      </Card>
    </QGroupContainerBox>
  );
}

export default RepeatGroup;
