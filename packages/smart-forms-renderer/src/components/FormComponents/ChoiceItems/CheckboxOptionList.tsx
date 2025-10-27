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

import React from 'react';
import type { QuestionnaireItemAnswerOption, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import CheckboxSingle from '../ItemParts/CheckboxSingle';
import { isOptionDisabled } from '../../../utils/choice';
import { deepEqual } from 'fast-equals';

interface CheckboxOptionListProps {
  options: QuestionnaireItemAnswerOption[];
  answers: QuestionnaireResponseItemAnswer[];
  readOnly: boolean;
  fullWidth: boolean;
  answerOptionsToggleExpressionsMap: Map<string, boolean>;
  onCheckedChange: (newValue: string) => void;
}

function CheckboxOptionList(props: CheckboxOptionListProps) {
  const {
    options,
    answers,
    readOnly,
    fullWidth,
    answerOptionsToggleExpressionsMap,
    onCheckedChange
  } = props;

  return (
    <>
      {options.map((option) => {
        const optionDisabledViaToggleExpression = isOptionDisabled(
          option,
          answerOptionsToggleExpressionsMap
        );

        if (option['valueCoding']) {
          return (
            <CheckboxSingle
              key={option.valueCoding.code ?? option.valueCoding.display ?? ''}
              value={option.valueCoding.code ?? option.valueCoding.display ?? ''}
              label={option.valueCoding.display ?? `${option.valueCoding.code}`}
              readOnly={readOnly}
              disabledViaToggleExpression={optionDisabledViaToggleExpression}
              fullWidth={fullWidth}
              isChecked={answers.some((answer) =>
                deepEqual(answer.valueCoding, option.valueCoding)
              )}
              onCheckedChange={onCheckedChange}
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
              disabledViaToggleExpression={optionDisabledViaToggleExpression}
              fullWidth={fullWidth}
              isChecked={answers.some((answer) => answer.valueString === option.valueString)}
              onCheckedChange={onCheckedChange}
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
              disabledViaToggleExpression={optionDisabledViaToggleExpression}
              fullWidth={fullWidth}
              isChecked={answers.some((answer) => answer.valueInteger === option.valueInteger)}
              onCheckedChange={onCheckedChange}
            />
          );
        }

        return null;
      })}
    </>
  );
}

export default CheckboxOptionList;
