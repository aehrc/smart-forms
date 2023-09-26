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
import { ChoiceItemOrientation } from '../../../interfaces/choice.enum';
import type { QuestionnaireItem } from 'fhir/r4';
import RadioAnswerOptionButtons from '../ItemParts/RadioAnswerOptionButtons';
import { StyledRadioGroup } from '../Item.styles';

interface ChoiceRadioAnswerOptionFieldsProps {
  qItem: QuestionnaireItem;
  valueRadio: string | null;
  orientation: ChoiceItemOrientation;
  readOnly: boolean;
  onCheckedChange: (newValue: string) => void;
}

function ChoiceRadioAnswerOptionFields(props: ChoiceRadioAnswerOptionFieldsProps) {
  const { qItem, valueRadio, orientation, readOnly, onCheckedChange } = props;

  return (
    <StyledRadioGroup
      row={orientation === ChoiceItemOrientation.Horizontal}
      name={qItem.text}
      id={qItem.id}
      onChange={(e) => onCheckedChange(e.target.value)}
      value={valueRadio}
      data-test="q-item-radio-group">
      <RadioAnswerOptionButtons qItem={qItem} readOnly={readOnly} />
    </StyledRadioGroup>
  );
}

export default ChoiceRadioAnswerOptionFields;
