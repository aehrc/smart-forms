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

import React, { useState } from 'react';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import useReadOnly from '../../../hooks/useReadOnly';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import { FullWidthFormComponentBox } from '../../Box.styles';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import useParseDates from './customDateTimePicker/hooks/useParseDates';
import CustomDateField from './customDateTimePicker/CustomDateField';
import {
  parseDisplayDateToFhirDate,
  parseFhirDateToDisplayDate,
  replaceMonthNameWithNumber
} from './customDateTimePicker/utils/parseDates';
import { createEmptyQrItem } from '../../../utils/qrItem';

interface CustomDateItemProps
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function CustomDateItem(props: CustomDateItemProps) {
  const { qItem, qrItem, isRepeated, isTabled, parentIsReadOnly, onQrItemChange } = props;

  const readOnly = useReadOnly(qItem, parentIsReadOnly);
  const { displayPrompt, displayInstructions, entryFormat } = useRenderingExtensions(qItem);

  const qrDate = qrItem ?? createEmptyQrItem(qItem);

  // Init input value
  let valueDate: string = '';
  if (qrDate.answer) {
    if (qrDate.answer[0].valueDate) {
      valueDate = qrDate.answer[0].valueDate;
    } else if (qrDate.answer[0].valueDateTime) {
      valueDate = qrDate.answer[0].valueDateTime;
    }
  }

  valueDate = parseFhirDateToDisplayDate(valueDate);
  const selectedDateToDisplay = valueDate.length === 0 ? 'N/A' : valueDate;

  const [input, setInput] = useState(valueDate);
  const [focused, setFocused] = useState(false);

  let options: string[] = [];
  const { dateOptions, seperator } = useParseDates(input);
  if (dateOptions) {
    options = dateOptions;
  }

  function handleValueChange(newDateString: string) {
    onQrItemChange({
      ...createEmptyQrItem(qItem),
      answer: [{ valueDate: parseDisplayDateToFhirDate(newDateString, seperator) }]
    });
  }

  function handleUnfocus() {
    // set answer to current input when text field is unfocused
    if (!valueDate && input !== '') {
      const replacedInput = replaceMonthNameWithNumber(input);
      const matchedOption = options.find((option) => replacedInput === option);
      if (matchedOption) {
        const newDateString = matchedOption.split(seperator).join('/');
        onQrItemChange({
          ...createEmptyQrItem(qItem),
          answer: [{ valueDate: parseDisplayDateToFhirDate(newDateString, seperator) }]
        });
      }
    }

    setFocused(false);
  }

  if (isRepeated) {
    return (
      <CustomDateField
        valueDate={valueDate}
        input={input}
        isFocused={focused}
        displayPrompt={displayPrompt}
        entryFormat={entryFormat}
        readOnly={readOnly}
        isTabled={isTabled}
        setFocused={setFocused}
        onInputChange={(newInput) => setInput(newInput)}
        onValueChange={handleValueChange}
        onUnfocus={handleUnfocus}
      />
    );
  }

  return (
    <FullWidthFormComponentBox data-test="q-item-date-box">
      <ItemFieldGrid
        qItem={qItem}
        displayInstructions={
          displayInstructions.length > 0 ? (
            displayInstructions
          ) : (
            <>
              Selected date: <b>{selectedDateToDisplay}</b>
            </>
          )
        }
        readOnly={readOnly}>
        <CustomDateField
          valueDate={valueDate}
          input={input}
          isFocused={focused}
          displayPrompt={displayPrompt}
          entryFormat={entryFormat}
          readOnly={readOnly}
          isTabled={isTabled}
          setFocused={setFocused}
          onInputChange={(newInput) => setInput(newInput)}
          onValueChange={handleValueChange}
          onUnfocus={handleUnfocus}
        />
      </ItemFieldGrid>
    </FullWidthFormComponentBox>
  );
}

export default CustomDateItem;
