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

import React, { useCallback } from 'react';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import { FullWidthFormComponentBox } from '../../Box.styles';
import useValidationError from '../../../hooks/useValidationError';
import debounce from 'lodash.debounce';
import { DEBOUNCE_DURATION } from '../../../utils/debounce';
import { createEmptyQrItemWithUnit } from '../../../utils/qrItem';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import DecimalField from './DecimalField';
import {
  parseDecimalStringToFloat,
  parseDecimalStringWithPrecision
} from '../../../utils/parseInputs';
import { getDecimalPrecision } from '../../../utils/itemControl';
import useDecimalCalculatedExpression from '../../../hooks/useDecimalCalculatedExpression';
import useStringInput from '../../../hooks/useStringInput';
import useReadOnly from '../../../hooks/useReadOnly';

interface DecimalItemProps
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function DecimalItem(props: DecimalItemProps) {
  const { qItem, qrItem, isRepeated, isTabled, parentIsReadOnly, onQrItemChange } = props;

  const readOnly = useReadOnly(qItem, parentIsReadOnly);
  const precision = getDecimalPrecision(qItem);
  const {
    displayUnit,
    displayPrompt,
    displayInstructions,
    entryFormat,
    regexValidation,
    maxLength
  } = useRenderingExtensions(qItem);

  // Init input value
  let valueDecimal = 0.0;
  let initialInput = '0';
  if (qrItem?.answer) {
    if (qrItem?.answer[0].valueDecimal) {
      valueDecimal = qrItem.answer[0].valueDecimal;
    }

    if (qrItem?.answer[0].valueInteger) {
      valueDecimal = qrItem.answer[0].valueInteger;
    }

    initialInput = precision ? valueDecimal.toFixed(precision) : valueDecimal.toString();
  }
  const [input, setInput] = useStringInput(initialInput);

  // Perform validation checks
  const feedback = useValidationError(input, regexValidation, maxLength);

  // Process calculated expressions
  const { calcExpUpdated } = useDecimalCalculatedExpression({
    qItem: qItem,
    inputValue: input,
    displayUnit: displayUnit,
    precision: precision,
    setInputValue: (newInput) => {
      setInput(newInput);
    },
    onQrItemChange: onQrItemChange
  });

  // Event handlers
  function handleInputChange(newInput: string) {
    const parsedNewInput: string = parseDecimalStringWithPrecision(newInput, precision);

    setInput(parsedNewInput);
    updateQrItemWithDebounce(parsedNewInput);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateQrItemWithDebounce = useCallback(
    debounce((parsedNewInput: string) => {
      onQrItemChange({
        ...createEmptyQrItemWithUnit(qItem, displayUnit),
        answer: precision
          ? [{ valueDecimal: parseDecimalStringToFloat(parsedNewInput, precision) }]
          : [{ valueDecimal: parseFloat(parsedNewInput) }]
      });
    }, DEBOUNCE_DURATION),
    [onQrItemChange, qItem, displayUnit, precision]
  ); // Dependencies are tested, debounce is causing eslint to not recognise dependencies

  if (isRepeated) {
    return (
      <DecimalField
        linkId={qItem.linkId}
        input={input}
        feedback={feedback}
        displayPrompt={displayPrompt}
        displayUnit={displayUnit}
        entryFormat={entryFormat}
        readOnly={readOnly}
        calcExpUpdated={calcExpUpdated}
        isTabled={isTabled}
        onInputChange={handleInputChange}
      />
    );
  }

  return (
    <FullWidthFormComponentBox data-test="q-item-decimal-box">
      <ItemFieldGrid qItem={qItem} displayInstructions={displayInstructions} readOnly={readOnly}>
        <DecimalField
          linkId={qItem.linkId}
          input={input}
          feedback={feedback}
          displayPrompt={displayPrompt}
          displayUnit={displayUnit}
          entryFormat={entryFormat}
          readOnly={readOnly}
          calcExpUpdated={calcExpUpdated}
          isTabled={isTabled}
          onInputChange={handleInputChange}
        />
      </ItemFieldGrid>
    </FullWidthFormComponentBox>
  );
}

export default DecimalItem;
