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
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponseItem
} from 'fhir/r4';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { FullWidthFormComponentBox } from '../../Box.styles';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import OpenChoiceSelectAnswerOptionField from './OpenChoiceSelectAnswerOptionField';
import useReadOnly from '../../../hooks/useReadOnly';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import { useQuestionnaireStore } from '../../../stores';

interface OpenChoiceSelectAnswerOptionItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
}

function OpenChoiceSelectAnswerOptionItem(props: OpenChoiceSelectAnswerOptionItemProps) {
  const { qItem, qrItem, isRepeated, isTabled, parentIsReadOnly, onQrItemChange } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Init input value
  const answerKey = qrItem?.answer?.[0].id;
  const answerOptions = qItem.answerOption;
  if (!answerOptions) return null;

  const qrOpenChoice = qrItem ?? createEmptyQrItem(qItem, answerKey);
  let valueSelect: QuestionnaireItemAnswerOption | null = null;
  if (qrOpenChoice.answer) {
    valueSelect = qrOpenChoice.answer[0] ?? null;
  }

  // Event handlers
  function handleChange(newValue: QuestionnaireItemAnswerOption | string | null) {
    if (newValue) {
      if (typeof newValue === 'string') {
        onQrItemChange({
          ...qrOpenChoice,
          answer: [{ id: answerKey, valueString: newValue }]
        });
        return;
      }

      const option = newValue;
      if (option['valueCoding']) {
        onQrItemChange({
          ...qrOpenChoice,
          answer: [{ id: answerKey, valueCoding: option.valueCoding }]
        });
      } else if (option['valueString']) {
        onQrItemChange({
          ...qrOpenChoice,
          answer: [{ id: answerKey, valueString: option.valueString }]
        });
      } else if (option['valueInteger']) {
        onQrItemChange({
          ...qrOpenChoice,
          answer: [{ id: answerKey, valueInteger: option.valueInteger }]
        });
      }
      return;
    }
    onQrItemChange(createEmptyQrItem(qItem, answerKey));
  }

  if (isRepeated) {
    return (
      <OpenChoiceSelectAnswerOptionField
        qItem={qItem}
        options={answerOptions}
        valueSelect={valueSelect}
        readOnly={readOnly}
        isTabled={isTabled}
        onChange={handleChange}
      />
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-open-choice-select-answer-option-box"
      data-linkid={qItem.linkId}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid qItem={qItem} readOnly={readOnly}>
        <OpenChoiceSelectAnswerOptionField
          qItem={qItem}
          options={answerOptions}
          valueSelect={valueSelect}
          readOnly={readOnly}
          isTabled={isTabled}
          onChange={handleChange}
        />
      </ItemFieldGrid>
    </FullWidthFormComponentBox>
  );
}

export default OpenChoiceSelectAnswerOptionItem;
