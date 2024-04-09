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

import React, { useMemo } from 'react';
import Stack from '@mui/material/Stack';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { getQrItemsIndex, mapQItemsIndex } from '../../utils/mapItem';
import { createEmptyQrGroup, updateQrItemsInGroup } from '../../utils/qrItem';
import type {
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler
} from '../../interfaces/renderProps.interface';
import { useQuestionnaireStore } from '../../stores';
import FormBodySingleCollapsibleWrapper from './FormBodySingleCollapsibleWrapper';

interface FormBodyCollapsibleProps
  extends PropsWithQrItemChangeHandler,
    PropsWithParentIsReadOnlyAttribute {
  topLevelQItem: QuestionnaireItem;
  topLevelQRItem: QuestionnaireResponseItem | null;
}

function FormBodyCollapsibleWrapper(props: FormBodyCollapsibleProps) {
  const { topLevelQItem, topLevelQRItem, parentIsReadOnly, onQrItemChange } = props;

  const tabs = useQuestionnaireStore.use.tabs();
  const currentTab = useQuestionnaireStore.use.currentTabIndex();
  const switchTab = useQuestionnaireStore.use.switchTab();

  const indexMap: Record<string, number> = useMemo(
    () => mapQItemsIndex(topLevelQItem),
    [topLevelQItem]
  );

  const nonNullTopLevelQRItem = topLevelQRItem ?? createEmptyQrGroup(topLevelQItem);

  const qItems = topLevelQItem.item;
  const qrItems = nonNullTopLevelQRItem.item;

  function handleQrGroupChange(qrItem: QuestionnaireResponseItem) {
    updateQrItemsInGroup(qrItem, null, nonNullTopLevelQRItem, indexMap);
    onQrItemChange(nonNullTopLevelQRItem);
  }

  if (!qItems || !qrItems) {
    return <>Unable to load form</>;
  }

  function handleToggleExpand(index: number) {
    switchTab(currentTab === index ? -1 : index);
  }

  if (!qItems || !qrItems) {
    return <>Unable to load form</>;
  }

  const qrItemsByIndex = getQrItemsIndex(qItems, qrItems, indexMap);

  return (
    <Stack rowGap={1}>
      {qItems.map((qItem, i) => {
        const qrItem = qrItemsByIndex[i];

        const isNotRepeatGroup = !Array.isArray(qrItem);
        const isTab = !!tabs[qItem.linkId];

        if (!isTab || !isNotRepeatGroup) {
          // Something has gone horribly wrong
          return null;
        }

        return (
          <FormBodySingleCollapsibleWrapper
            key={qItem.linkId}
            qItem={qItem}
            qrItem={qrItem ?? null}
            index={i}
            selectedIndex={currentTab}
            parentIsReadOnly={parentIsReadOnly}
            onToggleExpand={handleToggleExpand}
            onQrItemChange={handleQrGroupChange}
          />
        );
      })}
    </Stack>
  );
}

export default FormBodyCollapsibleWrapper;
