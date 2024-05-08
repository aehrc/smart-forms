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
import { ChoiceItemOrientation } from '../../../interfaces/choice.enum';
import CheckboxSingleWithOpenLabel from '../ItemParts/CheckboxSingleWithOpenLabel';
import type {
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import { getChoiceOrientation } from '../../../utils/choice';
import { StyledFormGroup } from '../Item.styles';
import CheckboxOptionList from '../ChoiceItems/CheckboxOptionList';

interface OpenChoiceCheckboxAnswerOptionFieldsProps {
  qItem: QuestionnaireItem;
  options: QuestionnaireItemAnswerOption[];
  answers: QuestionnaireResponseItemAnswer[];
  openLabelText: string | null;
  openLabelValue: string;
  openLabelChecked: boolean;
  readOnly: boolean;
  onOptionChange: (changedOptionValue: string) => void;
  onOpenLabelCheckedChange: (checked: boolean) => void;
  onOpenLabelInputChange: (input: string) => void;
}

function OpenChoiceCheckboxAnswerOptionFields(props: OpenChoiceCheckboxAnswerOptionFieldsProps) {
  const {
    qItem,
    options,
    answers,
    openLabelText,
    openLabelValue,
    openLabelChecked,
    readOnly,
    onOptionChange,
    onOpenLabelCheckedChange,
    onOpenLabelInputChange
  } = props;

  const orientation = getChoiceOrientation(qItem) ?? ChoiceItemOrientation.Vertical;

  return (
    <StyledFormGroup row={orientation === ChoiceItemOrientation.Horizontal}>
      <CheckboxOptionList
        options={options}
        answers={answers}
        readOnly={readOnly}
        onCheckedChange={onOptionChange}
      />

      {openLabelText !== null ? (
        <CheckboxSingleWithOpenLabel
          value={openLabelValue}
          label={openLabelText}
          isChecked={openLabelChecked}
          onCheckedChange={onOpenLabelCheckedChange}
          onInputChange={onOpenLabelInputChange}
        />
      ) : null}
    </StyledFormGroup>
  );
}

export default OpenChoiceCheckboxAnswerOptionFields;
