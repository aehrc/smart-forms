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

import { RepeatGroupContainerStack } from '../QItemRepeat.styles.tsx';
import { Box } from '@mui/material';
import QItemGroup from '../QItemGroup.tsx';
import type { PropsWithQrItemChangeHandler } from '../../../../types/renderProps.interface.ts';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import DeleteItemButton from './DeleteItemButton.tsx';

interface RepeatGroupItemProps extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  processedQrItem: QuestionnaireResponseItem;
  unprocessedQrItem: QuestionnaireResponseItem | null;
  numOfRepeatGroups: number;
  groupCardElevation: number;
  onDeleteItem: () => void;
}

function RepeatGroupItem(props: RepeatGroupItemProps) {
  const {
    qItem,
    processedQrItem,
    unprocessedQrItem,
    numOfRepeatGroups,
    groupCardElevation,
    onDeleteItem,
    onQrItemChange
  } = props;

  return (
    <RepeatGroupContainerStack direction="row" justifyContent="end">
      <Box sx={{ flexGrow: 1 }}>
        <QItemGroup
          qItem={qItem}
          qrItem={processedQrItem}
          isRepeated={true}
          groupCardElevation={groupCardElevation + 1}
          onQrItemChange={onQrItemChange}
        />
      </Box>
      <DeleteItemButton
        unprocessedQrItem={unprocessedQrItem}
        numOfRepeatGroups={numOfRepeatGroups}
        onDeleteItem={onDeleteItem}
      />
    </RepeatGroupContainerStack>
  );
}

export default RepeatGroupItem;
