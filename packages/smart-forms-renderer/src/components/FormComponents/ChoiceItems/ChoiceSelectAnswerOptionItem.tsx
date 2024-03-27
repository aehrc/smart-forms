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

import React from 'react';

import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { findInAnswerOptions, getQrChoiceValue } from '../../../utils/choice';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { FullWidthFormComponentBox } from '../../Box.styles';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import ChoiceSelectAnswerOptionFields from './ChoiceSelectAnswerOptionFields';
import useReadOnly from '../../../hooks/useReadOnly';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import { useQuestionnaireStore } from '../../../stores';

interface ChoiceSelectAnswerOptionItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
}

function ChoiceSelectAnswerOptionItem(props: ChoiceSelectAnswerOptionItemProps) {
  const { qItem, qrItem, isRepeated, isTabled, parentIsReadOnly, onQrItemChange } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Init input value
  const qrChoiceSelect = qrItem ?? createEmptyQrItem(qItem);
  let valueSelect = getQrChoiceValue(qrChoiceSelect);
  if (!valueSelect) {
    valueSelect = '';
  }

  // Event handlers
  function handleChange(newValue: string) {
    if (qItem.answerOption) {
      const qrAnswer = findInAnswerOptions(qItem.answerOption, newValue);
      if (qrAnswer) {
        onQrItemChange({ ...createEmptyQrItem(qItem), answer: [qrAnswer] });
        return;
      }
    }
    onQrItemChange(createEmptyQrItem(qItem));
  }

  if (isRepeated) {
    return (
      <ChoiceSelectAnswerOptionFields
        qItem={qItem}
        valueSelect={valueSelect}
        readOnly={readOnly}
        isTabled={isTabled}
        onSelectChange={handleChange}
      />
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-choice-select-answer-option-box"
      data-linkid={qItem.linkId}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid qItem={qItem} readOnly={readOnly}>
        <ChoiceSelectAnswerOptionFields
          qItem={qItem}
          valueSelect={valueSelect}
          readOnly={readOnly}
          isTabled={isTabled}
          onSelectChange={handleChange}
        />
      </ItemFieldGrid>
    </FullWidthFormComponentBox>
  );
}

export default ChoiceSelectAnswerOptionItem;
