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

import React, { useState } from 'react';
import type { BaseItemProps } from '../../../../interfaces/renderProps.interface';
import useReadOnly from '../../../../hooks/useReadOnly';
import { FullWidthFormComponentBox } from '../../../Box.styles';
import ItemFieldGrid from '../../ItemParts/ItemFieldGrid';
import {
  parseFhirDateToDisplayDate,
  parseInputDateToFhirDate,
  validateDateInput
} from '../utils/parseDate';
import { createEmptyQrItem } from '../../../../utils/qrItem';
import useDateValidation from '../../../../hooks/useDateValidation';
import CustomDateField from './CustomDateField';
import { useQuestionnaireStore } from '../../../../stores';
import ItemLabel from '../../ItemParts/ItemLabel';
import useDateCalculatedExpression from '../../../../hooks/useDateCalculatedExpression';

function CustomDateItem(props: BaseItemProps) {
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
  const qrDate = qrItem ?? createEmptyQrItem(qItem, answerKey);
  let valueDate: string = '';
  if (qrDate.answer) {
    if (qrDate.answer[0].valueDate) {
      valueDate = qrDate.answer[0].valueDate;
    } else if (qrDate.answer[0].valueDateTime) {
      valueDate = qrDate.answer[0].valueDateTime;
    }
  }

  const { displayDate, dateParseFail } = parseFhirDateToDisplayDate(valueDate);

  const [input, setInput] = useState(displayDate);
  const [focused, setFocused] = useState(false);

  // Perform validation checks
  const feedback = useDateValidation(input, dateParseFail);

  // Process calculated expressions
  const { calcExpUpdated } = useDateCalculatedExpression({
    qItem: qItem,
    valueDateFhir: valueDate,
    onChangeByCalcExpressionString: (newValueDateFhir: string) => {
      const { displayDate } = parseFhirDateToDisplayDate(newValueDateFhir);
      setInput(displayDate);
      onQrItemChange({
        ...createEmptyQrItem(qItem, answerKey),
        answer: [{ id: answerKey, valueDate: parseInputDateToFhirDate(newValueDateFhir) }]
      });
    },
    onChangeByCalcExpressionNull: () => {
      setInput('');
      onQrItemChange(createEmptyQrItem(qItem, answerKey));
    }
  });

  function handleSelectDate(selectedDate: string) {
    setInput(selectedDate);
    onQrItemChange({
      ...createEmptyQrItem(qItem, answerKey),
      answer: [{ id: answerKey, valueDate: parseInputDateToFhirDate(selectedDate) }]
    });
  }

  function handleInputChange(newInput: string) {
    setInput(newInput);

    if (newInput === '') {
      onQrItemChange(createEmptyQrItem(qItem, answerKey));
    }
    if (!validateDateInput(newInput)) {
      return;
    }

    onQrItemChange({
      ...createEmptyQrItem(qItem, answerKey),
      answer: [{ id: answerKey, valueDate: parseInputDateToFhirDate(newInput) }]
    });
  }

  if (isRepeated) {
    return (
      <CustomDateField
        linkId={qItem.linkId}
        itemType={qItem.type}
        itemText={qItem.text}
        valueDate={displayDate}
        input={input}
        feedback={feedback ?? ''}
        isFocused={focused}
        displayPrompt={displayPrompt}
        entryFormat={entryFormat}
        readOnly={readOnly}
        calcExpUpdated={calcExpUpdated}
        isPartOfDateTime={false}
        isTabled={isTabled}
        setFocused={setFocused}
        onInputChange={handleInputChange}
        onSelectDate={handleSelectDate}
      />
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-date-box"
      data-linkid={qItem.linkId}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} />}
        fieldChildren={
          <CustomDateField
            linkId={qItem.linkId}
            itemType={qItem.type}
            itemText={qItem.text}
            valueDate={displayDate}
            input={input}
            feedback={feedback ?? ''}
            isFocused={focused}
            displayPrompt={displayPrompt}
            entryFormat={entryFormat}
            readOnly={readOnly}
            calcExpUpdated={calcExpUpdated}
            isPartOfDateTime={false}
            isTabled={isTabled}
            setFocused={setFocused}
            onInputChange={handleInputChange}
            onSelectDate={handleSelectDate}
          />
        }
        feedback={feedback ?? undefined}
      />
    </FullWidthFormComponentBox>
  );
}

export default CustomDateItem;
