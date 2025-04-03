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

import React, { useState } from 'react';
import type { BaseItemProps } from '../../../../interfaces/renderProps.interface';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import useReadOnly from '../../../../hooks/useReadOnly';
import { FullWidthFormComponentBox } from '../../../Box.styles';
import ItemFieldGrid from '../../ItemParts/ItemFieldGrid';
import { parseInputDateToFhirDate } from '../utils/parseDate';
import { createEmptyQrItem } from '../../../../utils/qrItem';
import useDateValidation from '../../../../hooks/useDateValidation';
import CustomDateField from './CustomDateField';
import { useQuestionnaireStore } from '../../../../stores';
import ItemLabel from '../../ItemParts/ItemLabel';

interface CustomDateItemProps extends Omit<BaseItemProps, 'onQrItemChange'> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  isRepeated: boolean;
  isTabled: boolean;
  parentIsReadOnly?: boolean;
  feedbackFromParent?: string;
  onQrItemChange: (qrItem: QuestionnaireResponseItem) => void;
}

function CustomDateItem(props: CustomDateItemProps) {
  const {
    qItem,
    qrItem,
    isRepeated,
    isTabled,
    parentIsReadOnly = false,
    feedbackFromParent,
    onQrItemChange
  } = props;

  const readOnly = useReadOnly(qItem, parentIsReadOnly);
  const entryFormat = qItem.extension?.find(ext => ext.url === 'http://hl7.org/fhir/StructureDefinition/rendering-style')?.extension?.find(ext => ext.url === 'entry-format')?.valueString || '';

  // Init input value
  const answerKey = qrItem?.answer?.[0].id;
  let valueString = '';
  if (qrItem?.answer && qrItem?.answer[0].valueString) {
    valueString = qrItem.answer[0].valueString;
  }

  const [input, setInput] = useState(valueString);
  const [isFocused, setIsFocused] = useState(false);

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  // Perform validation checks
  const errorFeedback = useDateValidation(input);

  function handleSelectDate(selectedDate: string) {
    setInput(selectedDate);
    const fhirDate = parseInputDateToFhirDate(selectedDate);
    if (fhirDate) {
      onQrItemChange({
        ...createEmptyQrItem(qItem, answerKey),
        answer: [{ id: answerKey, valueString: fhirDate }]
      });
    } else {
      onQrItemChange(createEmptyQrItem(qItem, answerKey));
    }
  }

  function handleInputChange(newInput: string) {
    setInput(newInput);
    const fhirDate = parseInputDateToFhirDate(newInput);
    if (fhirDate) {
      onQrItemChange({
        ...createEmptyQrItem(qItem, answerKey),
        answer: [{ id: answerKey, valueString: fhirDate }]
      });
    } else {
      onQrItemChange(createEmptyQrItem(qItem, answerKey));
    }
  }

  function handleFocusChange(value: boolean | ((prevState: boolean) => boolean)) {
    setIsFocused(value);
    if (typeof value === 'boolean' && value) {
      onFocusLinkId(qItem.linkId);
    }
  }

  return (
    <FullWidthFormComponentBox>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} />}
        fieldChildren={
          <CustomDateField
            linkId={qItem.linkId}
            itemType={qItem.type}
            valueDate={valueString}
            input={input}
            feedback={errorFeedback ?? ''}
            isFocused={isFocused}
            displayPrompt={''}
            entryFormat={entryFormat}
            readOnly={readOnly}
            isPartOfDateTime={false}
            isTabled={isTabled}
            setFocused={handleFocusChange}
            onInputChange={handleInputChange}
            onSelectDate={handleSelectDate}
          />
        }
      />
    </FullWidthFormComponentBox>
  );
}

export default CustomDateItem;
