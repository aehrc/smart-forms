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
import { useRendererConfigStore } from '../../../stores';
import { includeAnsweredOptions, isDisplayUnavailable } from '../../../utils/openChoice';
import { StyledWarningTypography } from '../Item.styles';
import AccessibleFeedback from '../ItemParts/AccessibleFeedback';
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
  instructionsId?: string;
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
    instructionsId,
    onCheckedChange,
    onClear
  } = props;

  const rendererStrings = useRendererConfigStore.use.rendererStrings();

  // Hide options whose display couldn't be resolved so raw codes are never shown in the list,
  // but never hide an option the user has already answered - it stays visible using its
  // originally-recorded display (or a raw code as a last resort) instead of vanishing outright.
  const visibleOptions = includeAnsweredOptions(options, answers);
  // Warn whenever anything couldn't be freshly resolved, even if it's still shown via fallback -
  // a merged-back answer can look fine on screen while quietly relying on a stale/raw-code label.
  const hasUnavailableDisplayOptions = options.some(isDisplayUnavailable);

  return (
    <>
      <CheckboxFormGroup
        qItem={qItem}
        options={visibleOptions}
        answers={answers}
        feedback={feedback}
        readOnly={readOnly}
        expressionUpdated={expressionUpdated}
        answerOptionsToggleExpressionsMap={answerOptionsToggleExpressionsMap}
        isTabled={isTabled}
        instructionsId={instructionsId}
        onCheckedChange={onCheckedChange}
        onClear={onClear}
      />
      {hasUnavailableDisplayOptions ? (
        <StyledWarningTypography>
          <AccessibleFeedback>{rendererStrings.answerOptionDisplayUnavailable}</AccessibleFeedback>
        </StyledWarningTypography>
      ) : null}
    </>
  );
}

export default ChoiceCheckboxAnswerOptionFields;
