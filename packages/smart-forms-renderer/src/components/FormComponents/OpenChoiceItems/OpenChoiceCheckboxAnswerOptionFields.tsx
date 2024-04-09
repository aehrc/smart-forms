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
import { StyledFormGroup } from '../Item.styles';
import { ChoiceItemOrientation } from '../../../interfaces/choice.enum';
import CheckboxSingle from '../ItemParts/CheckboxSingle';
import CheckboxSingleWithOpenLabel from '../ItemParts/CheckboxSingleWithOpenLabel';
import type { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { getChoiceOrientation } from '../../../utils/choice';

interface OpenChoiceCheckboxAnswerOptionFieldsProps {
  qItem: QuestionnaireItem;
  answers: QuestionnaireResponseItemAnswer[];
  openLabelText: string | null;
  openLabelValue: string;
  openLabelChecked: boolean;
  readOnly: boolean;
  onValueChange: (changedOptionValue: string | null, changedOpenLabelValue: string | null) => void;
  onOpenLabelCheckedChange: (checked: boolean) => void;
  onOpenLabelInputChange: (input: string) => void;
}

function OpenChoiceCheckboxAnswerOptionFields(props: OpenChoiceCheckboxAnswerOptionFieldsProps) {
  const {
    qItem,
    answers,
    openLabelText,
    openLabelValue,
    openLabelChecked,
    readOnly,
    onValueChange,
    onOpenLabelCheckedChange,
    onOpenLabelInputChange
  } = props;

  const orientation = getChoiceOrientation(qItem) ?? ChoiceItemOrientation.Vertical;

  return (
    <StyledFormGroup row={orientation === ChoiceItemOrientation.Horizontal}>
      {qItem.answerOption?.map((option) => {
        if (option['valueCoding']) {
          return (
            <CheckboxSingle
              key={option.valueCoding.code ?? ''}
              value={option.valueCoding.code ?? ''}
              label={option.valueCoding.display ?? `${option.valueCoding.code}`}
              readOnly={readOnly}
              isChecked={answers.some(
                (answer) => JSON.stringify(answer) === JSON.stringify(option)
              )}
              onCheckedChange={(changedValue) => onValueChange(changedValue, null)}
            />
          );
        }

        if (option['valueString']) {
          return (
            <CheckboxSingle
              key={option.valueString}
              value={option.valueString}
              label={option.valueString}
              readOnly={readOnly}
              isChecked={answers.some((answer) => answer.valueString === option.valueString)}
              onCheckedChange={(changedValue) => onValueChange(changedValue, null)}
            />
          );
        }

        if (option['valueInteger']) {
          return (
            <CheckboxSingle
              key={option.valueInteger}
              value={option.valueInteger.toString()}
              label={option.valueInteger.toString()}
              readOnly={readOnly}
              isChecked={answers.some((answer) => answer.valueInteger === option.valueInteger)}
              onCheckedChange={(changedValue) => onValueChange(changedValue, null)}
            />
          );
        }

        return null;
      })}

      {openLabelText ? (
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
