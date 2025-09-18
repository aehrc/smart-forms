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

import type {
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import CheckboxFormGroup from '../ItemParts/CheckboxFormGroup';
import CheckboxSingleWithOpenLabel from '../ItemParts/CheckboxSingleWithOpenLabel';

interface OpenChoiceCheckboxAnswerOptionFieldsProps {
  qItem: QuestionnaireItem;
  options: QuestionnaireItemAnswerOption[];
  answers: QuestionnaireResponseItemAnswer[];
  openLabelText: string;
  openLabelValue: string;
  openLabelChecked: boolean;
  feedback: string;
  readOnly: boolean;
  expressionUpdated: boolean;
  answerOptionsToggleExpressionsMap: Map<string, boolean>;
  isTabled: boolean;
  onOptionChange: (changedOptionValue: string) => void;
  onOpenLabelCheckedChange: (checked: boolean) => void;
  onOpenLabelInputChange: (input: string) => void;
  onClear: () => void;
}

function OpenChoiceCheckboxAnswerOptionFields(props: OpenChoiceCheckboxAnswerOptionFieldsProps) {
  const {
    qItem,
    options,
    answers,
    openLabelText,
    openLabelValue,
    openLabelChecked,
    feedback,
    readOnly,
    expressionUpdated,
    answerOptionsToggleExpressionsMap,
    isTabled,
    onOptionChange,
    onOpenLabelCheckedChange,
    onOpenLabelInputChange,
    onClear
  } = props;

  return (
    <CheckboxFormGroup
      qItem={qItem}
      options={options}
      answers={answers}
      feedback={feedback}
      readOnly={readOnly}
      expressionUpdated={expressionUpdated}
      answerOptionsToggleExpressionsMap={answerOptionsToggleExpressionsMap}
      isTabled={isTabled}
      onCheckedChange={onOptionChange}
      onClear={onClear}>
      <CheckboxSingleWithOpenLabel
        value={openLabelValue}
        label={openLabelText}
        readOnly={readOnly}
        isChecked={openLabelChecked}
        onCheckedChange={onOpenLabelCheckedChange}
        onInputChange={onOpenLabelInputChange}
      />
    </CheckboxFormGroup>
  );
}

export default OpenChoiceCheckboxAnswerOptionFields;
