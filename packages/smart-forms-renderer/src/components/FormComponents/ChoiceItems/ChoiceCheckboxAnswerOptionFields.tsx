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

interface ChoiceCheckboxAnswerOptionFieldsProps {
  qItem: QuestionnaireItem;
  options: QuestionnaireItemAnswerOption[];
  answers: QuestionnaireResponseItemAnswer[];
  feedback: string;
  readOnly: boolean;
  expressionUpdated: boolean;
  answerOptionsToggleExpressionsMap: Map<string, boolean>;
  isTabled: boolean;
  onCheckedChange: (newValue: string) => void;
  onClear: () => void;
}

function ChoiceCheckboxAnswerOptionFields(props: ChoiceCheckboxAnswerOptionFieldsProps) {
  const {
    qItem,
    options,
    answers,
    feedback,
    readOnly,
    expressionUpdated,
    answerOptionsToggleExpressionsMap,
    isTabled,
    onCheckedChange,
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
      onCheckedChange={onCheckedChange}
      onClear={onClear}
    />
  );
}

export default ChoiceCheckboxAnswerOptionFields;
