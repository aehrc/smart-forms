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
import type { QuestionnaireItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import QItemChoiceCheckboxSingle from '../ItemParts/CheckboxSingle';
import { StyledFormGroup } from '../Item.styles';
import { getChoiceOrientation } from '../../../utils/choice';

interface ChoiceCheckboxAnswerOptionFieldsProps {
  qItem: QuestionnaireItem;
  answers: QuestionnaireResponseItemAnswer[];
  readOnly: boolean;
  onCheckedChange: (newValue: string) => void;
}

function ChoiceCheckboxAnswerOptionFields(props: ChoiceCheckboxAnswerOptionFieldsProps) {
  const { qItem, answers, readOnly, onCheckedChange } = props;

  const orientation = getChoiceOrientation(qItem) ?? ChoiceItemOrientation.Vertical;

  return (
    <StyledFormGroup row={orientation === ChoiceItemOrientation.Horizontal}>
      {qItem.answerOption?.map((option) => {
        if (option['valueCoding']) {
          return (
            <QItemChoiceCheckboxSingle
              key={option.valueCoding.code ?? ''}
              value={option.valueCoding.code ?? ''}
              label={option.valueCoding.display ?? `${option.valueCoding.code}`}
              readOnly={readOnly}
              isChecked={answers.some(
                (answer) => JSON.stringify(answer) === JSON.stringify(option)
              )}
              onCheckedChange={onCheckedChange}
            />
          );
        }

        if (option['valueString']) {
          return (
            <QItemChoiceCheckboxSingle
              key={option.valueString}
              value={option.valueString}
              label={option.valueString}
              readOnly={readOnly}
              isChecked={answers.some((answer) => answer.valueString === option.valueString)}
              onCheckedChange={onCheckedChange}
            />
          );
        }

        if (option['valueInteger']) {
          return (
            <QItemChoiceCheckboxSingle
              key={option.valueInteger}
              value={option.valueInteger.toString()}
              label={option.valueInteger.toString()}
              readOnly={readOnly}
              isChecked={answers.some((answer) => answer.valueInteger === option.valueInteger)}
              onCheckedChange={onCheckedChange}
            />
          );
        }

        return null;
      })}
    </StyledFormGroup>
  );
}

export default ChoiceCheckboxAnswerOptionFields;
