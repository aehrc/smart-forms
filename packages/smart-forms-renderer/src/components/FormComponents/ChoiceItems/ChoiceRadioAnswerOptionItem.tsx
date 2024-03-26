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
import type { ChoiceItemOrientation } from '../../../interfaces/choice.enum';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { findInAnswerOptions, getQrChoiceValue } from '../../../utils/choice';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { FullWidthFormComponentBox } from '../../Box.styles';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import ChoiceRadioAnswerOptionFields from './ChoiceRadioAnswerOptionFields';
import useReadOnly from '../../../hooks/useReadOnly';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';

interface ChoiceRadioAnswerOptionItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
  orientation: ChoiceItemOrientation;
}

function ChoiceRadioAnswerOptionItem(props: ChoiceRadioAnswerOptionItemProps) {
  const { qItem, qrItem, orientation, isRepeated, parentIsReadOnly, onQrItemChange } = props;

  // Init input value
  const qrChoiceRadio = qrItem ?? createEmptyQrItem(qItem);
  const valueRadio = getQrChoiceValue(qrChoiceRadio);

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Event handlers
  function handleChange(newValue: string) {
    if (qItem.answerOption) {
      const qrAnswer = findInAnswerOptions(qItem.answerOption, newValue);
      if (qrAnswer) {
        onQrItemChange({ ...createEmptyQrItem(qItem), answer: [qrAnswer] });
      }
    }
  }

  if (isRepeated) {
    return (
      <ChoiceRadioAnswerOptionFields
        qItem={qItem}
        valueRadio={valueRadio}
        orientation={orientation}
        readOnly={readOnly}
        onCheckedChange={handleChange}
      />
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-choice-radio-answer-option-box"
      data-linkid={qItem.linkId}>
      <ItemFieldGrid qItem={qItem} readOnly={readOnly}>
        <ChoiceRadioAnswerOptionFields
          qItem={qItem}
          valueRadio={valueRadio}
          orientation={orientation}
          readOnly={readOnly}
          onCheckedChange={handleChange}
        />
      </ItemFieldGrid>
    </FullWidthFormComponentBox>
  );
}

export default ChoiceRadioAnswerOptionItem;
