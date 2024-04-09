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
import { RepeatGroupContainerStack } from '../RepeatItem/RepeatItem.styles';
import Box from '@mui/material/Box';
import GroupItem from '../GroupItem/GroupItem';
import type {
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler,
  PropsWithShowMinimalViewAttribute
} from '../../../interfaces/renderProps.interface';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import DeleteItemButton from './DeleteItemButton';
import useReadOnly from '../../../hooks/useReadOnly';

interface RepeatGroupItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithShowMinimalViewAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  repeatGroupIndex: number;
  answeredQrItem: QuestionnaireResponseItem;
  nullableQrItem: QuestionnaireResponseItem | null;
  numOfRepeatGroups: number;
  groupCardElevation: number;
  onDeleteItem: () => void;
}

function RepeatGroupItem(props: RepeatGroupItemProps) {
  const {
    qItem,
    repeatGroupIndex,
    answeredQrItem,
    nullableQrItem,
    numOfRepeatGroups,
    groupCardElevation,
    showMinimalView,
    parentIsReadOnly,
    onDeleteItem,
    onQrItemChange
  } = props;

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  return (
    <RepeatGroupContainerStack direction="row" justifyContent="end">
      <Box sx={{ flexGrow: 1 }}>
        <GroupItem
          qItem={qItem}
          qrItem={answeredQrItem}
          isRepeated={true}
          parentIsRepeatGroup={true}
          parentRepeatGroupIndex={repeatGroupIndex}
          parentIsReadOnly={parentIsReadOnly}
          groupCardElevation={groupCardElevation + 1}
          onQrItemChange={onQrItemChange}
        />
      </Box>
      {showMinimalView ? null : (
        <DeleteItemButton
          nullableQrItem={nullableQrItem}
          numOfRepeatGroups={numOfRepeatGroups}
          readOnly={readOnly}
          onDeleteItem={onDeleteItem}
        />
      )}
    </RepeatGroupContainerStack>
  );
}

export default RepeatGroupItem;
