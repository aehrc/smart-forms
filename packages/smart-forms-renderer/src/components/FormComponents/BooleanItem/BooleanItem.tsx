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
import BooleanField from './BooleanField';
import Box from '@mui/material/Box';
import useReadOnly from '../../../hooks/useReadOnly';
import { useQuestionnaireStore } from '../../../stores';
import useBooleanCalculatedExpression from '../../../hooks/useBooleanCalculatedExpression';
import useValidationFeedback from '../../../hooks/useValidationFeedback';
import ItemLabel from '../ItemParts/ItemLabel';

function BooleanItem(props: BaseItemProps) {
  const {
    qItem,
    qrItem,
    itemPath,
    isRepeated,
    isTabled,
    parentIsReadOnly,
    feedbackFromParent,
    onQrItemChange
  } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Perform validation checks - there's no string-based input here
  const feedback = useValidationFeedback(qItem, feedbackFromParent);

  // Init input value
  const answerKey = qrItem?.answer?.[0]?.id;
  let valueBoolean: boolean | undefined = undefined;
  if (qrItem?.answer?.[0]?.valueBoolean !== undefined) {
    valueBoolean = qrItem.answer[0].valueBoolean;
  }

  // Process calculated expressions
  const { calcExpUpdated } = useBooleanCalculatedExpression({
    qItem: qItem,
    booleanValue: valueBoolean,
    onChangeByCalcExpressionBoolean: (newValueBoolean: boolean) => {
      onQrItemChange(
        {
          ...createEmptyQrItem(qItem, answerKey),
          answer: [{ id: answerKey, valueBoolean: newValueBoolean }]
        },
        itemPath
      );
    },
    onChangeByCalcExpressionNull: () => {
      onQrItemChange(createEmptyQrItem(qItem, answerKey), itemPath);
    }
  });

  // Event handlers
  function handleValueChange(newValue: string) {
    switch (newValue) {
      case 'true':
        onQrItemChange({
          ...createEmptyQrItem(qItem, answerKey),
          answer: [{ id: answerKey, valueBoolean: true }]
        });
        break;
      case 'false':
        onQrItemChange({
          ...createEmptyQrItem(qItem, answerKey),
          answer: [{ id: answerKey, valueBoolean: false }]
        });
        break;
      default:
        onQrItemChange(createEmptyQrItem(qItem, answerKey));
        break;
    }
  }

  function handleClear() {
    onQrItemChange(createEmptyQrItem(qItem, answerKey));
  }

  if (isTabled) {
    return (
      <Box display="flex" justifyContent="center">
        <BooleanField
          qItem={qItem}
          readOnly={readOnly}
          valueBoolean={valueBoolean}
          feedback={feedback}
          calcExpUpdated={calcExpUpdated}
          onCheckedChange={handleValueChange}
          onClear={handleClear}
        />
      </Box>
    );
  }

  if (isRepeated) {
    return (
      <BooleanField
        qItem={qItem}
        readOnly={readOnly}
        valueBoolean={valueBoolean}
        feedback={feedback}
        calcExpUpdated={calcExpUpdated}
        onCheckedChange={handleValueChange}
        onClear={handleClear}
      />
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-boolean-box"
      data-linkid={qItem.linkId}
      data-label={qItem.text}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} />}
        fieldChildren={
          <BooleanField
            qItem={qItem}
            readOnly={readOnly}
            valueBoolean={valueBoolean}
            feedback={feedback}
            calcExpUpdated={calcExpUpdated}
            onCheckedChange={handleValueChange}
            onClear={handleClear}
          />
        }
      />
    </FullWidthFormComponentBox>
  );
}

export default BooleanItem;
