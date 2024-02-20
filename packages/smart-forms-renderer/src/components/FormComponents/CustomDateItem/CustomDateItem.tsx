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
import {
  parseFhirDateToDisplayDate,
  parseInputDateToFhirDate,
  validateInput
} from './customDateTimePicker/utils/parseDates';
import { createEmptyQrItem } from '../../../utils/qrItem';
import useDateValidation from '../../../hooks/useDateValidation';
import CustomDateField from './customDateTimePicker/CustomDateField';

interface CustomDateItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
}

function CustomDateItem(props: CustomDateItemProps) {
  const { qItem, qrItem, isRepeated, isTabled, parentIsReadOnly, onQrItemChange } = props;

  const readOnly = useReadOnly(qItem, parentIsReadOnly);
  const { displayPrompt, entryFormat, required } = useRenderingExtensions(qItem);

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

  const { displayDate, parseFail } = parseFhirDateToDisplayDate(valueDate);

  const [input, setInput] = useState(displayDate);
  const [focused, setFocused] = useState(false);

  // Perform validation checks
  const errorFeedback = useDateValidation(input, parseFail);

  function handleSelectDate(selectedDate: string) {
    setInput(selectedDate);
    onQrItemChange({
      ...createEmptyQrItem(qItem),
      answer: [{ valueDate: parseInputDateToFhirDate(selectedDate) }]
    });
  }

  function handleInputChange(newInput: string) {
    setInput(newInput);

    if (newInput === '') {
      onQrItemChange(createEmptyQrItem(qItem));
    }

    if (!validateInput(newInput)) {
      return;
    }

    onQrItemChange({
      ...createEmptyQrItem(qItem),
      answer: [{ valueDate: parseInputDateToFhirDate(newInput) }]
    });
  }

  if (isRepeated) {
    return (
      <CustomDateField
        linkId={qItem.linkId}
        valueDate={displayDate}
        input={input}
        feedback={errorFeedback ?? ''}
        isFocused={focused}
        displayPrompt={displayPrompt}
        entryFormat={entryFormat}
        readOnly={readOnly}
        isTabled={isTabled}
        setFocused={setFocused}
        onInputChange={handleInputChange}
        onSelectDate={handleSelectDate}
      />
    );
  }

  return (
    <FullWidthFormComponentBox data-test="q-item-date-box">
      <ItemFieldGrid qItem={qItem} required={required} readOnly={readOnly}>
        <CustomDateField
          linkId={qItem.linkId}
          valueDate={displayDate}
          input={input}
          feedback={errorFeedback ?? ''}
          isFocused={focused}
          displayPrompt={displayPrompt}
          entryFormat={entryFormat}
          readOnly={readOnly}
          isTabled={isTabled}
          setFocused={setFocused}
          onInputChange={handleInputChange}
          onSelectDate={handleSelectDate}
        />
      </ItemFieldGrid>
    </FullWidthFormComponentBox>
  );
}

export default CustomDateItem;
