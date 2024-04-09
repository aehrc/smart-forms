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

import type { ChangeEvent } from 'react';
import React from 'react';
import { ChoiceItemOrientation } from '../../../interfaces/choice.enum';
import type { QuestionnaireItem } from 'fhir/r4';
import { StyledRadioGroup } from '../Item.styles';
import RadioButtonWithOpenLabel from '../ItemParts/RadioButtonWithOpenLabel';
import RadioAnswerOptionButtons from '../ItemParts/RadioAnswerOptionButtons';
import { getChoiceOrientation } from '../../../utils/choice';

interface OpenChoiceRadioAnswerOptionFieldsProps {
  qItem: QuestionnaireItem;
  valueRadio: string | null;
  openLabelText: string | null;
  openLabelValue: string | null;
  openLabelSelected: boolean;
  readOnly: boolean;
  onValueChange: (changedOptionValue: string | null, changedOpenLabelValue: string | null) => void;
}

function OpenChoiceRadioAnswerOptionFields(props: OpenChoiceRadioAnswerOptionFieldsProps) {
  const {
    qItem,
    valueRadio,
    openLabelText,
    openLabelValue,
    openLabelSelected,
    readOnly,
    onValueChange
  } = props;

  const orientation = getChoiceOrientation(qItem) ?? ChoiceItemOrientation.Vertical;

  return (
    <StyledRadioGroup
      row={orientation === ChoiceItemOrientation.Horizontal}
      name={qItem.text}
      id={qItem.id}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onValueChange(e.target.value, null)}
      value={valueRadio}
      data-test="q-item-radio-group">
      <RadioAnswerOptionButtons qItem={qItem} readOnly={readOnly} />

      {openLabelText ? (
        <RadioButtonWithOpenLabel
          value={openLabelValue}
          label={openLabelText}
          readOnly={readOnly}
          isSelected={openLabelSelected}
          onInputChange={(input) => onValueChange(null, input)}
        />
      ) : null}
    </StyledRadioGroup>
  );
}

export default OpenChoiceRadioAnswerOptionFields;
