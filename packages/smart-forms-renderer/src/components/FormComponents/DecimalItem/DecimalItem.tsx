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

import React, { useCallback, useState } from 'react';
import type { BaseItemProps } from '../../../interfaces/renderProps.interface';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { FullWidthFormComponentBox } from '../../Box.styles';
import useValidationFeedback from '../../../hooks/useValidationFeedback';
import debounce from 'lodash.debounce';
import { DEBOUNCE_DURATION } from '../../../utils/debounce';
import { createEmptyQrItem } from '../../../utils/qrItem';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import DecimalField from './DecimalField';
import {
  parseDecimalStringToFloat,
  parseDecimalStringWithPrecision
} from '../../../utils/parseInputs';
import { getDecimalPrecision } from '../../../utils/itemControl';
import useDecimalCalculatedExpression from '../../../hooks/useDecimalCalculatedExpression';
import useReadOnly from '../../../hooks/useReadOnly';
import { useQuestionnaireStore } from '../../../stores';
import Box from '@mui/material/Box';
import ItemLabel from '../ItemParts/ItemLabel';

interface DecimalItemProps extends BaseItemProps {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
}

function DecimalItem(props: DecimalItemProps) {
  const {
    qItem,
    qrItem,
    isRepeated,
    isTabled,
    renderingExtensions,
    parentIsReadOnly,
    feedbackFromParent,
    onQrItemChange
  } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const precision = getDecimalPrecision(qItem);
  const { displayUnit, displayPrompt, entryFormat } = renderingExtensions;

  // Init input value
  const answerKey = qrItem?.answer?.[0]?.id;
  let valueDecimal = 0.0;
  let initialInput = '';
  if (qrItem?.answer) {
    if (qrItem?.answer[0].valueDecimal) {
      valueDecimal = qrItem.answer[0].valueDecimal;
    }

    if (qrItem?.answer[0].valueInteger) {
      valueDecimal = qrItem.answer[0].valueInteger;
    }

    initialInput = precision ? valueDecimal.toFixed(precision) : valueDecimal.toString();
  }

  const [input, setInput] = useState(initialInput);
  const [showFeedback, setShowFeedback] = useState(true); //provides a way to hide the feedback when the user is typing

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Perform validation checks - there's no string-based input here
  const feedback = useValidationFeedback(qItem, feedbackFromParent, input);

  // Process calculated expressions
  const { calcExpUpdated } = useDecimalCalculatedExpression({
    qItem: qItem,
    inputValue: input,
    precision: precision,
    onChangeByCalcExpressionDecimal: (newValueDecimal: number) => {
      setInput(
        typeof precision === 'number'
          ? newValueDecimal.toFixed(precision)
          : newValueDecimal.toString()
      );
      onQrItemChange({
        ...createEmptyQrItem(qItem, answerKey),
        answer: [{ id: answerKey, valueDecimal: newValueDecimal }]
      });
    },
    onChangeByCalcExpressionNull: () => {
      setInput('');
      onQrItemChange(createEmptyQrItem(qItem, answerKey));
    }
  });

  // Event handlers
  function handleInputChange(newInput: string) {
    const parsedNewInput: string = parseDecimalStringWithPrecision(newInput, precision);

    setInput(parsedNewInput);
    setShowFeedback(false);
    updateQrItemWithDebounce(parsedNewInput);
  }
  function handleBlur() {
    setShowFeedback(true);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateQrItemWithDebounce = useCallback(
    debounce((parsedNewInput: string) => {
      const emptyQrItem = createEmptyQrItem(qItem, answerKey);
      if (parsedNewInput === '') {
        onQrItemChange(emptyQrItem);
      } else {
        onQrItemChange({
          ...emptyQrItem,
          answer: precision
            ? [
                {
                  id: answerKey,
                  valueDecimal: parseDecimalStringToFloat(parsedNewInput, precision)
                }
              ]
            : [{ id: answerKey, valueDecimal: parseFloat(parsedNewInput) }]
        });
      }
    }, DEBOUNCE_DURATION),
    [onQrItemChange, qItem, displayUnit, precision]
  ); // Dependencies are tested, debounce is causing eslint to not recognise dependencies

  if (isRepeated) {
    return (
      <Box data-test="q-item-decimal-box">
        <DecimalField
          linkId={qItem.linkId}
          itemType={qItem.type}
          input={input}
          feedback={feedback}
          displayPrompt={displayPrompt}
          displayUnit={displayUnit}
          entryFormat={entryFormat}
          readOnly={readOnly}
          calcExpUpdated={calcExpUpdated}
          isTabled={isTabled}
          onInputChange={handleInputChange}
          onBlur={handleBlur}
        />
      </Box>
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-decimal-box"
      data-linkid={qItem.linkId}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} />}
        fieldChildren={
          <DecimalField
            linkId={qItem.linkId}
            itemType={qItem.type}
            input={input}
            feedback={showFeedback ? feedback : ''}
            displayPrompt={displayPrompt}
            displayUnit={displayUnit}
            entryFormat={entryFormat}
            readOnly={readOnly}
            calcExpUpdated={calcExpUpdated}
            isTabled={isTabled}
            onInputChange={handleInputChange}
            onBlur={handleBlur}
          />
        }
        feedback={feedback}
      />
    </FullWidthFormComponentBox>
  );
}

export default DecimalItem;
