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

import { useMemo } from 'react';
import { Stack } from '@mui/material';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { getQrItemsIndex, mapQItemsIndex } from '../../utils';
import { updateLinkedItem } from '../../utils/qrItem.ts';
import type { PropsWithQrItemChangeHandler } from '../../types/renderProps.interface.ts';
import useQuestionnaireStore from '../../../../stores/useQuestionnaireStore.ts';
import FormBodySingleCollapsibleWrapper from './Collapsible/FormBodySingleCollapsibleWrapper.tsx';

interface FormBodyCollapsibleProps extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  topLevelQItem: QuestionnaireItem;
  topLevelQRItem: QuestionnaireResponseItem;
}

function FormBodyCollapsibleWrapper(props: FormBodyCollapsibleProps) {
  const { topLevelQItem, topLevelQRItem, onQrItemChange } = props;

  const currentTab = useQuestionnaireStore((state) => state.currentTabIndex);
  const tabs = useQuestionnaireStore((state) => state.tabs);

  const switchTab = useQuestionnaireStore((state) => state.switchTab);

  const indexMap: Record<string, number> = useMemo(
    () => mapQItemsIndex(topLevelQItem),
    [topLevelQItem]
  );

  const qItems = topLevelQItem.item;
  const qrItems = topLevelQRItem.item;

  function handleQrGroupChange(qrItem: QuestionnaireResponseItem) {
    updateLinkedItem(qrItem, null, topLevelQRItem, indexMap);
    onQrItemChange(topLevelQRItem);
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
            qrItem={qrItem}
            index={i}
            selectedIndex={currentTab}
            onToggleExpand={handleToggleExpand}
            onQrItemChange={handleQrGroupChange}
          />
        );
      })}
    </Stack>
  );
}

export default FormBodyCollapsibleWrapper;
