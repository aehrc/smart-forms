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

import React, { useCallback, useState } from 'react';
import type { BaseItemProps } from '../../../interfaces/renderProps.interface';
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
import { getDecimalPrecision } from '../../../utils/extensions';
import useDecimalCalculatedExpression from '../../../hooks/useDecimalCalculatedExpression';
import useReadOnly from '../../../hooks/useReadOnly';
import { useQuestionnaireStore } from '../../../stores';
import ItemLabel from '../ItemParts/ItemLabel';
import useShowFeedback from '../../../hooks/useShowFeedback';
import type { QuestionnaireResponseItem } from 'fhir/r4';
import { readDecimalValue } from '../../../utils/readValues';

function DecimalItem(props: BaseItemProps) {
  const {
    qItem,
    qrItem,
    itemPath,
    isRepeated,
    isTabled,
    renderingExtensions,
    parentIsReadOnly,
    feedbackFromParent,
    onQrItemChange
  } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const precision = getDecimalPrecision(qItem);

  // Init input value
  const answerKey = qrItem?.answer?.[0]?.id;
  const { initialInput } = readDecimalValue(qrItem, precision);

  const [input, setInput] = useState(initialInput);

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Perform validation checks - there's no string-based input here
  const feedback = useValidationFeedback(qItem, feedbackFromParent);

  // Provides a way to hide the feedback when the user is typing
  const { showFeedback, setShowFeedback, hasBlurred, setHasBlurred } = useShowFeedback();

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
      onQrItemChange(
        {
          ...createEmptyQrItem(qItem, answerKey),
          answer: [{ id: answerKey, valueDecimal: newValueDecimal }]
        },
        itemPath
      );
    },
    onChangeByCalcExpressionNull: () => {
      setInput('');
      onQrItemChange(createEmptyQrItem(qItem, answerKey), itemPath);
    }
  });

  // Event handlers
  function handleInputChange(newInput: string) {
    const parsedNewInput: string = parseDecimalStringWithPrecision(newInput, precision);

    setInput(parsedNewInput);

    // Only suppress feedback once (before first blur)
    if (!hasBlurred) {
      setShowFeedback(false);
    }

    updateQrItemWithDebounce(parsedNewInput);
  }

  function handleBlur() {
    setShowFeedback(true);
    setHasBlurred(true); // From now on, feedback should stay visible
  }

  function handleRepopulateSync(newQrItem: QuestionnaireResponseItem | null) {
    if (newQrItem && newQrItem?.answer) {
      const { valueDecimal: newValueDecimal, initialInput: newInput } = readDecimalValue(
        newQrItem,
        precision
      );

      setInput(newInput);
      onQrItemChange(
        {
          ...createEmptyQrItem(qItem, answerKey),
          answer: [{ id: answerKey, valueDecimal: newValueDecimal }]
        },
        itemPath
      );
      return;
    }

    // At this point newQrItem is null, so create an QRItem to replace it
    setInput('');
    onQrItemChange(createEmptyQrItem(qItem, answerKey), itemPath);
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
    [onQrItemChange, qItem, precision]
  ); // Dependencies are tested, debounce is causing eslint to not recognise dependencies

  if (isRepeated) {
    return (
      <DecimalField
        qItem={qItem}
        input={input}
        feedback={showFeedback ? feedback : ''}
        renderingExtensions={renderingExtensions}
        readOnly={readOnly}
        calcExpUpdated={calcExpUpdated}
        isTabled={isTabled}
        onInputChange={handleInputChange}
        onRepopulateSync={handleRepopulateSync}
        onBlur={handleBlur}
      />
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-decimal-box"
      data-linkid={qItem.linkId}
      data-label={qItem.text}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} />}
        fieldChildren={
          <DecimalField
            qItem={qItem}
            input={input}
            feedback={showFeedback ? feedback : ''}
            renderingExtensions={renderingExtensions}
            readOnly={readOnly}
            calcExpUpdated={calcExpUpdated}
            isTabled={isTabled}
            onInputChange={handleInputChange}
            onRepopulateSync={handleRepopulateSync}
            onBlur={handleBlur}
          />
        }
        feedback={showFeedback ? feedback : undefined}
      />
    </FullWidthFormComponentBox>
  );
}

export default DecimalItem;
