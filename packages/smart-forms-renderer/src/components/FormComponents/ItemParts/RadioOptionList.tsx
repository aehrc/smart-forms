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
import ChoiceRadioSingle from '../ChoiceItems/ChoiceRadioSingle';
import type { QuestionnaireItemAnswerOption } from 'fhir/r4';
import { isOptionDisabled } from '../../../utils/choice';
import StyledText from './StyledText';

interface RadioOptionListProps {
  options: QuestionnaireItemAnswerOption[];
  readOnly: boolean;
  fullWidth: boolean;
  answerOptionsToggleExpressionsMap: Map<string, boolean>;
}

function RadioOptionList(props: RadioOptionListProps) {
  const { options, readOnly, fullWidth, answerOptionsToggleExpressionsMap } = props;

  return (
    <>
      {options.map((option) => {
        const optionDisabledViaToggleExpression = isOptionDisabled(
          option,
          answerOptionsToggleExpressionsMap
        );

        if (option['valueCoding']) {
          return (
            <ChoiceRadioSingle
              key={option.valueCoding.code ?? ''}
              value={option.valueCoding.code ?? ''}
              label={option.valueCoding.display ?? `${option.valueCoding.code}`}
              readOnly={readOnly}
              disabledViaToggleExpression={optionDisabledViaToggleExpression}
              fullWidth={fullWidth}
            />
          );
        }

        if (option['valueString']) {
          return (
            <ChoiceRadioSingle
              key={option.valueString}
              value={option.valueString}
              label={
                <StyledText textToDisplay={option.valueString} element={option._valueString} />
              }
              readOnly={readOnly}
              disabledViaToggleExpression={optionDisabledViaToggleExpression}
              fullWidth={fullWidth}
            />
          );
        }

        if (option['valueInteger']) {
          return (
            <ChoiceRadioSingle
              key={option.valueInteger}
              value={option.valueInteger.toString()}
              label={option.valueInteger.toString()}
              readOnly={readOnly}
              disabledViaToggleExpression={optionDisabledViaToggleExpression}
              fullWidth={fullWidth}
            />
          );
        }

        return null;
      })}
    </>
  );
}

export default RadioOptionList;
