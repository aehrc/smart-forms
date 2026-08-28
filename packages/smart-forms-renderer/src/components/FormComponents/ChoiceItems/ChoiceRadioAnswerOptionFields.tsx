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

import type { QuestionnaireItem, QuestionnaireItemAnswerOption } from 'fhir/r4';
import { useRendererConfigStore } from '../../../stores';
import { isDisplayUnavailable } from '../../../utils/openChoice';
import { StyledWarningTypography } from '../Item.styles';
import AccessibleFeedback from '../ItemParts/AccessibleFeedback';
import RadioFormGroup from '../ItemParts/RadioFormGroup';

interface ChoiceRadioAnswerOptionFieldsProps {
  qItem: QuestionnaireItem;
  options: QuestionnaireItemAnswerOption[];
  valueRadio: string | null;
  feedback: string;
  readOnly: boolean;
  expressionUpdated: boolean;
  answerOptionsToggleExpressionsMap: Map<string, boolean>;
  isTabled: boolean;
  instructionsId: string | undefined;
  onCheckedChange: (newValue: string) => void;
  onClear: () => void;
}

function ChoiceRadioAnswerOptionFields(props: ChoiceRadioAnswerOptionFieldsProps) {
  const {
    qItem,
    options,
    valueRadio,
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

  // Hide options whose display couldn't be resolved so raw codes are never shown in the list.
  const hasUnavailableDisplayOptions = options.some(isDisplayUnavailable);
  const visibleOptions = options.filter((option) => !isDisplayUnavailable(option));

  return (
    <>
      <RadioFormGroup
        qItem={qItem}
        options={visibleOptions}
        valueRadio={valueRadio}
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

export default ChoiceRadioAnswerOptionFields;
