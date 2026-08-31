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
import RadioButtonWithOpenLabel from '../ItemParts/RadioButtonWithOpenLabel';
import RadioFormGroup from '../ItemParts/RadioFormGroup';

interface OpenChoiceRadioAnswerOptionFieldsProps {
  qItem: QuestionnaireItem;
  options: QuestionnaireItemAnswerOption[];
  valueRadio: string | null;
  answers: QuestionnaireResponseItemAnswer[];
  openLabelText: string;
  openLabelValue: string | null;
  openLabelSelected: boolean;
  feedback: string;
  readOnly: boolean;
  expressionUpdated: boolean;
  answerOptionsToggleExpressionsMap: Map<string, boolean>;
  isTabled: boolean;
  instructionsId?: string;
  onValueChange: (changedOptionValue: string | null, changedOpenLabelValue: string | null) => void;
  onClear: () => void;
}

function OpenChoiceRadioAnswerOptionFields(props: OpenChoiceRadioAnswerOptionFieldsProps) {
  const {
    qItem,
    options,
    valueRadio,
    answers,
    openLabelText,
    openLabelValue,
    openLabelSelected,
    feedback,
    readOnly,
    expressionUpdated,
    answerOptionsToggleExpressionsMap,
    isTabled,
    instructionsId,
    onValueChange,
    onClear
  } = props;

  const rendererStrings = useRendererConfigStore.use.rendererStrings();

  // Hide options whose display couldn't be resolved so raw codes are never shown in the list,
  // but never hide the currently selected answer - it stays visible using its originally-recorded
  // display (or a raw code as a last resort) instead of vanishing from the radio group entirely.
  const hasUnavailableDisplayOptions = options.some(isDisplayUnavailable);
  const visibleOptions = includeAnsweredOptions(options, answers);

  return (
    <>
      <RadioFormGroup
        data-test={`radio-group-${openLabelValue}`}
        qItem={qItem}
        options={visibleOptions}
        valueRadio={valueRadio}
        feedback={feedback}
        readOnly={readOnly}
        expressionUpdated={expressionUpdated}
        answerOptionsToggleExpressionsMap={answerOptionsToggleExpressionsMap}
        isTabled={isTabled}
        instructionsId={instructionsId}
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
      {hasUnavailableDisplayOptions ? (
        <StyledWarningTypography>
          <AccessibleFeedback>{rendererStrings.answerOptionDisplayUnavailable}</AccessibleFeedback>
        </StyledWarningTypography>
      ) : null}
    </>
  );
}

export default OpenChoiceRadioAnswerOptionFields;
