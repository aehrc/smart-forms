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
import type { BaseItemProps } from '../../../interfaces/renderProps.interface';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { FullWidthFormComponentBox } from '../../Box.styles';
import TimeField from './TimeField';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import useReadOnly from '../../../hooks/useReadOnly';
import { useQuestionnaireStore } from '../../../stores';
import ItemLabel from '../ItemParts/ItemLabel';

function TimeItem(props: BaseItemProps) {
  const {
    qItem,
    qrItem,
    isRepeated,
    isTabled,
    renderingExtensions,
    parentIsReadOnly,
    onQrItemChange
  } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const readOnly = useReadOnly(qItem, parentIsReadOnly);
  const { displayPrompt, entryFormat } = renderingExtensions;

  // Init input value
  const answerKey = qrItem?.answer?.[0]?.id;
  let timeString: string | null = null;
  if (qrItem?.answer && qrItem?.answer[0].valueTime) {
    timeString = qrItem.answer[0].valueTime;
  }
  const timeDayJs = timeString ? dayjs(timeString, 'HH:mm:ss') : null;

  // Event handlers
  function handleTimeChange(newValue: Dayjs | null) {
    const emptyQrItem = createEmptyQrItem(qItem, answerKey);
    if (newValue) {
      onQrItemChange({
        ...emptyQrItem,
        answer: [{ id: answerKey, valueTime: newValue.format('HH:mm:ss') }]
      });
    } else {
      onQrItemChange(emptyQrItem);
    }
  }

  if (isRepeated) {
    return (
      <TimeField
        linkId={qItem.linkId}
        itemType={qItem.type}
        value={timeDayJs}
        displayPrompt={displayPrompt}
        entryFormat={entryFormat}
        readOnly={readOnly}
        onTimeChange={handleTimeChange}
        isTabled={isTabled}
      />
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-time-box"
      data-linkid={qItem.linkId}
      data-label={qItem.text}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} />}
        fieldChildren={
          <TimeField
            linkId={qItem.linkId}
            itemType={qItem.type}
            value={timeDayJs}
            displayPrompt={displayPrompt}
            entryFormat={entryFormat}
            readOnly={readOnly}
            onTimeChange={handleTimeChange}
            isTabled={isTabled}
          />
        }
      />
    </FullWidthFormComponentBox>
  );
}

export default TimeItem;
