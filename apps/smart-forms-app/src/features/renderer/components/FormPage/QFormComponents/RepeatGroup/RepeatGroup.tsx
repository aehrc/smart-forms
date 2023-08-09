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

import { useState } from 'react';
import type { PropsWithQrRepeatGroupChangeHandler } from '../../../../types/renderProps.interface.ts';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import useInitialiseRepeatGroups from '../../../../hooks/useInitialiseRepeatGroups.ts';
import { QGroupContainerBox } from '../../../../../../components/Box/Box.styles.tsx';
import { Card, Collapse, Divider } from '@mui/material';
import { QGroupHeadingTypography } from '../Typography.styles.ts';
import { TransitionGroup } from 'react-transition-group';
import { createEmptyQrItem } from '../../../../utils/qrItem.ts';
import { nanoid } from 'nanoid';
import RepeatGroupItem from './RepeatGroupItem.tsx';
import AddItemButton from './AddItemButton.tsx';
import LabelWrapper from '../QItemParts/LabelWrapper.tsx';

interface RepeatGroupProps extends PropsWithQrRepeatGroupChangeHandler {
  qItem: QuestionnaireItem;
  qrItems: QuestionnaireResponseItem[];
  groupCardElevation: number;
}

function RepeatGroup(props: RepeatGroupProps) {
  const { qItem, qrItems, groupCardElevation, onQrRepeatGroupChange } = props;

  const initialRepeatGroups = useInitialiseRepeatGroups(qrItems);

  const [repeatGroups, setRepeatGroups] = useState(initialRepeatGroups);

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
        singleGroup.qrItem ? [singleGroup.qrItem] : []
      )
    });
  }

  function handleDeleteItem(index: number) {
    const updatedRepeatGroups = [...repeatGroups];

    updatedRepeatGroups.splice(index, 1);

    setRepeatGroups(updatedRepeatGroups);
    onQrRepeatGroupChange({
      linkId: qItem.linkId,
      qrItems: updatedRepeatGroups.flatMap((singleGroup) =>
        singleGroup.qrItem ? [singleGroup.qrItem] : []
      )
    });
  }

  function handleAddItem() {
    setRepeatGroups([
      ...repeatGroups,
      {
        nanoId: nanoid(),
        qrItem: null
      }
    ]);
  }

  return (
    <QGroupContainerBox key={qItem.linkId} cardElevation={groupCardElevation} isRepeated={true}>
      <Card elevation={groupCardElevation} sx={{ p: 3, py: 2.5, mb: 3.5 }}>
        <QGroupHeadingTypography variant="h6">
          <LabelWrapper qItem={qItem} />
        </QGroupHeadingTypography>
        <Divider sx={{ mt: 1, mb: 1.5 }} light />
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
                  answeredQrItem={answeredQrItem}
                  nullableQrItem={nullableQrItem}
                  numOfRepeatGroups={repeatGroups.length}
                  groupCardElevation={groupCardElevation + 1}
                  onDeleteItem={() => handleDeleteItem(index)}
                  onQrItemChange={(newQrItem) => handleAnswerChange(newQrItem, index)}
                />
              </Collapse>
            );
          })}
        </TransitionGroup>

        <AddItemButton repeatGroups={repeatGroups} onAddItem={handleAddItem} />
      </Card>
    </QGroupContainerBox>
  );
}

export default RepeatGroup;
