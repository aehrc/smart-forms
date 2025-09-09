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
import type { QuestionnaireItem, QuestionnaireItemAnswerOption } from 'fhir/r4';
import RadioButtonWithOpenLabel from '../ItemParts/RadioButtonWithOpenLabel';
import RadioFormGroup from '../ItemParts/RadioFormGroup';

interface OpenChoiceRadioAnswerOptionFieldsProps {
  qItem: QuestionnaireItem;
  options: QuestionnaireItemAnswerOption[];
  valueRadio: string | null;
  openLabelText: string;
  openLabelValue: string | null;
  openLabelSelected: boolean;
  feedback: string;
  readOnly: boolean;
  expressionUpdated: boolean;
  answerOptionsToggleExpressionsMap: Map<string, boolean>;
  isTabled: boolean;
  onValueChange: (changedOptionValue: string | null, changedOpenLabelValue: string | null) => void;
  onClear: () => void;
}

function OpenChoiceRadioAnswerOptionFields(props: OpenChoiceRadioAnswerOptionFieldsProps) {
  const {
    qItem,
    options,
    valueRadio,
    openLabelText,
    openLabelValue,
    openLabelSelected,
    feedback,
    readOnly,
    expressionUpdated,
    answerOptionsToggleExpressionsMap,
    isTabled,
    onValueChange,
    onClear
  } = props;

  return (
    <RadioFormGroup
      data-test={`radio-group-${openLabelValue}`}
      qItem={qItem}
      options={options}
      valueRadio={valueRadio}
      feedback={feedback}
      readOnly={readOnly}
      expressionUpdated={expressionUpdated}
      answerOptionsToggleExpressionsMap={answerOptionsToggleExpressionsMap}
      isTabled={isTabled}
      onCheckedChange={(newValue) => onValueChange(newValue, null)}
      onClear={onClear}>
      <RadioButtonWithOpenLabel
        value={openLabelValue}
        label={openLabelText}
        readOnly={readOnly}
        isSelected={openLabelSelected}
        onInputChange={(input) => onValueChange(null, input)}
      />
    </RadioFormGroup>
  );
}

export default OpenChoiceRadioAnswerOptionFields;
