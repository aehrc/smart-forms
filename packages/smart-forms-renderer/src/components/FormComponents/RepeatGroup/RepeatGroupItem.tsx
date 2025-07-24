/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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
import { RepeatGroupContainerStack } from '../RepeatItem/RepeatItem.styles';
import Box from '@mui/material/Box';
import GroupItem from '../GroupItem/GroupItem';
import type {
  PropsWithItemPathAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import RemoveItemButton from './RemoveItemButton';
import useReadOnly from '../../../hooks/useReadOnly';

interface RepeatGroupItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithItemPathAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  repeatGroupIndex: number;
  answeredQrItem: QuestionnaireResponseItem;
  nullableQrItem: QuestionnaireResponseItem | null;
  numOfRepeatGroups: number;
  groupCardElevation: number;
  onRemoveItem: () => void;
}

function RepeatGroupItem(props: RepeatGroupItemProps) {
  const {
    qItem,
    repeatGroupIndex,
    answeredQrItem,
    nullableQrItem,
    numOfRepeatGroups,
    itemPath,
    groupCardElevation,
    parentIsReadOnly,
    onRemoveItem,
    onQrItemChange
  } = props;

  const readOnly = useReadOnly(qItem, parentIsReadOnly, repeatGroupIndex);

  return (
    <RepeatGroupContainerStack direction="row" justifyContent="end">
      <Box sx={{ flexGrow: 1 }}>
        <GroupItem
          qItem={qItem}
          qrItem={answeredQrItem}
          itemPath={itemPath}
          isRepeated={true}
          parentIsRepeatGroup={true}
          parentRepeatGroupIndex={repeatGroupIndex}
          parentIsReadOnly={parentIsReadOnly}
          groupCardElevation={groupCardElevation}
          onQrItemChange={onQrItemChange}
        />
      </Box>
      <RemoveItemButton
        nullableQrItem={nullableQrItem}
        numOfRepeatGroups={numOfRepeatGroups}
        readOnly={readOnly}
        onRemoveItem={onRemoveItem}
      />
    </RepeatGroupContainerStack>
  );
}

export default RepeatGroupItem;
