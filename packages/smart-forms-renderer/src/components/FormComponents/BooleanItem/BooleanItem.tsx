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
import BooleanField from './BooleanField';
import Box from '@mui/material/Box';
import useReadOnly from '../../../hooks/useReadOnly';
import { useQuestionnaireStore } from '../../../stores';
import useBooleanCalculatedExpression from '../../../hooks/useBooleanCalculatedExpression';

interface BooleanItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
}

function BooleanItem(props: BooleanItemProps) {
  const { qItem, qrItem, isRepeated, isTabled, parentIsReadOnly, onQrItemChange } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Init input value
  const answerKey = qrItem?.answer?.[0].id;
  let valueBoolean: boolean | undefined = undefined;
  if (qrItem?.answer?.[0]?.valueBoolean !== undefined) {
    valueBoolean = qrItem.answer[0].valueBoolean;
  }

  // Process calculated expressions
  const { calcExpUpdated } = useBooleanCalculatedExpression({
    qItem: qItem,
    booleanValue: valueBoolean,
    onChangeByCalcExpressionBoolean: (newValueBoolean: boolean) => {
      onQrItemChange({
        ...createEmptyQrItem(qItem, answerKey),
        answer: [{ id: answerKey, valueBoolean: newValueBoolean }]
      });
    },
    onChangeByCalcExpressionNull: () => {
      onQrItemChange(createEmptyQrItem(qItem, answerKey));
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
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid qItem={qItem} readOnly={readOnly}>
        <BooleanField
          qItem={qItem}
          readOnly={readOnly}
          valueBoolean={valueBoolean}
          calcExpUpdated={calcExpUpdated}
          onCheckedChange={handleValueChange}
          onClear={handleClear}
        />
      </ItemFieldGrid>
    </FullWidthFormComponentBox>
  );
}

export default BooleanItem;
