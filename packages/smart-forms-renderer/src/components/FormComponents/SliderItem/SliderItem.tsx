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
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { FullWidthFormComponentBox } from '../../Box.styles';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import useReadOnly from '../../../hooks/useReadOnly';
import SliderField from './SliderField';
import useSliderExtensions from '../../../hooks/useSliderExtensions';
import Box from '@mui/material/Box';
import { useQuestionnaireStore } from '../../../stores';

interface SliderItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
}

function SliderItem(props: SliderItemProps) {
  const { qItem, qrItem, isRepeated, isTabled, parentIsReadOnly, onQrItemChange } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const readOnly = useReadOnly(qItem, parentIsReadOnly);
  const { minValue, maxValue, stepValue, minLabel, maxLabel } = useSliderExtensions(qItem);

  const isInteracted = !!qrItem?.answer;

  // Init input value
  const answerKey = qrItem?.answer?.[0].id;
  let valueInteger = 0;
  if (qrItem?.answer) {
    if (qrItem?.answer[0].valueInteger) {
      valueInteger = qrItem.answer[0].valueInteger;
    }
    if (qrItem?.answer[0].valueDecimal) {
      valueInteger = Math.round(qrItem.answer[0].valueDecimal);
    }
  }

  // Event handlers
  function handleValueChange(newValue: number) {
    onQrItemChange({
      ...createEmptyQrItem(qItem, answerKey),
      answer: [{ id: answerKey, valueInteger: newValue }]
    });
  }

  if (isRepeated) {
    return (
      <Box px={4}>
        <SliderField
          linkId={qItem.linkId}
          value={valueInteger}
          minValue={minValue}
          maxValue={maxValue}
          stepValue={stepValue}
          minLabel={minLabel}
          maxLabel={maxLabel}
          isInteracted={isInteracted}
          readOnly={readOnly}
          isTabled={isTabled}
          onValueChange={handleValueChange}
        />
      </Box>
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-slider-box"
      data-linkid={qItem.linkId}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid qItem={qItem} readOnly={readOnly}>
        <Box px={4}>
          <SliderField
            linkId={qItem.linkId}
            value={valueInteger}
            minValue={minValue}
            maxValue={maxValue}
            stepValue={stepValue}
            minLabel={minLabel}
            maxLabel={maxLabel}
            isInteracted={isInteracted}
            readOnly={readOnly}
            isTabled={isTabled}
            onValueChange={handleValueChange}
          />
        </Box>
      </ItemFieldGrid>
    </FullWidthFormComponentBox>
  );
}

export default SliderItem;
