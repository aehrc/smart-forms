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
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import useReadOnly from '../../../hooks/useReadOnly';
import SliderField from './SliderField';
import useSliderExtensions from '../../../hooks/useSliderExtensions';
import Box from '@mui/material/Box';
import { useQuestionnaireStore } from '../../../stores';
import useValidationFeedback from '../../../hooks/useValidationFeedback';
import ItemLabel from '../ItemParts/ItemLabel';

function SliderItem(props: BaseItemProps) {
  const {
    qItem,
    qrItem,
    isRepeated,
    isTabled,
    parentIsReadOnly,
    feedbackFromParent,
    onQrItemChange
  } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const { minValue, maxValue, stepValue, minLabel, maxLabel } = useSliderExtensions(qItem);

  const isInteracted = !!qrItem?.answer;

  // Init input value
  const answerKey = qrItem?.answer?.[0]?.id;
  let valueInteger = 0;
  if (qrItem?.answer) {
    if (qrItem?.answer[0].valueInteger) {
      valueInteger = qrItem.answer[0].valueInteger;
    }
    if (qrItem?.answer[0].valueDecimal) {
      valueInteger = Math.round(qrItem.answer[0].valueDecimal);
    }
  }

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Perform validation checks
  const feedback = useValidationFeedback(qItem, feedbackFromParent);

  // Event handlers
  function handleValueChange(newValue: number) {
    onQrItemChange({
      ...createEmptyQrItem(qItem, answerKey),
      answer: [{ id: answerKey, valueInteger: newValue }]
    });
  }

  if (isRepeated) {
    return (
      <Box px={1} width="100%">
        <SliderField
          linkId={qItem.linkId}
          itemType={qItem.type}
          value={valueInteger}
          minValue={minValue}
          maxValue={maxValue}
          stepValue={stepValue}
          minLabel={minLabel}
          maxLabel={maxLabel}
          isInteracted={isInteracted}
          feedback={feedback}
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
      data-label={qItem.text}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} />}
        fieldChildren={
          <Box px={4}>
            <SliderField
              linkId={qItem.linkId}
              itemType={qItem.type}
              value={valueInteger}
              minValue={minValue}
              maxValue={maxValue}
              stepValue={stepValue}
              minLabel={minLabel}
              maxLabel={maxLabel}
              isInteracted={isInteracted}
              feedback={feedback}
              readOnly={readOnly}
              isTabled={isTabled}
              onValueChange={handleValueChange}
            />
          </Box>
        }
      />
    </FullWidthFormComponentBox>
  );
}

export default SliderItem;
