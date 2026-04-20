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
import Autocomplete from '@mui/material/Autocomplete';
import type { QuestionnaireItem, QuestionnaireItemAnswerOption } from 'fhir/r4';
import type {
  PropsWithIsTabledAttribute,
  PropsWithRenderingExtensionsAttribute
} from '../../../interfaces/renderProps.interface';
import { useRendererConfigStore } from '../../../stores';
import { compareAnswerOptionValue, isOptionDisabled } from '../../../utils/choice';
import { getAnswerOptionLabel } from '../../../utils/openChoice';
import { StyledRequiredTypography } from '../Item.styles';
import DisplayUnitText from '../ItemParts/DisplayUnitText';
import ExpressionUpdateFadingIcon from '../ItemParts/ExpressionUpdateFadingIcon';
import { StandardTextField } from '../Textfield.styles';
import StyledText from '../ItemParts/StyledText';

interface ChoiceSelectAnswerOptionFieldsProps
  extends PropsWithIsTabledAttribute,
    PropsWithRenderingExtensionsAttribute {
  qItem: QuestionnaireItem;
  options: QuestionnaireItemAnswerOption[];
  valueSelect: QuestionnaireItemAnswerOption | null;
  feedback: string;
  readOnly: boolean;
  expressionUpdated: boolean;
  answerOptionsToggleExpressionsMap: Map<string, boolean>;
  instructionsId: string | undefined;
  onSelectChange: (newValue: QuestionnaireItemAnswerOption | null) => void;
}

function ChoiceSelectAnswerOptionFields(props: ChoiceSelectAnswerOptionFieldsProps) {
  const {
    qItem,
    options,
    valueSelect,
    feedback,
    readOnly,
    expressionUpdated,
    isTabled,
    renderingExtensions,
    answerOptionsToggleExpressionsMap,
    instructionsId,
    onSelectChange
  } = props;

  const readOnlyVisualStyle = useRendererConfigStore.use.readOnlyVisualStyle();
  const textFieldWidth = useRendererConfigStore.use.textFieldWidth();

  const { displayUnit, displayPrompt, entryFormat } = renderingExtensions;

  // Initialise with the selected value's label so the textarea shows it immediately
  const [inputValue, setInputValue] = React.useState(
    valueSelect ? getAnswerOptionLabel(valueSelect) : ''
  );

  // Keep track of current selected value when input is changed
  const [currentValueSelect, setCurrentValueSelect] =
    React.useState<QuestionnaireItemAnswerOption | null>(valueSelect);

  return (
    <>
      <Autocomplete
        id={qItem.type + '-' + qItem.linkId}
        value={valueSelect ?? null}
        options={options}
        getOptionDisabled={(option) => isOptionDisabled(option, answerOptionsToggleExpressionsMap)}
        getOptionLabel={(option) => getAnswerOptionLabel(option)}
        isOptionEqualToValue={(option, value) => compareAnswerOptionValue(option, value)}
        onChange={(_, newValue) => {
          onSelectChange(newValue);
          setCurrentValueSelect(newValue);
          setInputValue(newValue ? getAnswerOptionLabel(newValue) : '');
        }}
        inputValue={inputValue}
        onInputChange={(_, newInputValue, reason) => {
          if (reason === 'input') {
            // User is typing — if a value is selected, typing clears it
            if (valueSelect) {
              onSelectChange(null);
            }
            setInputValue(newInputValue);
          } else if (reason === 'clear') {
            setInputValue('');
          }
          // Ignore 'reset' — handled by onChange above
        }}
        onBlur={() => {
          // Restore the last confirmed selection on blur
          if (currentValueSelect) {
            onSelectChange(currentValueSelect);
            setInputValue(getAnswerOptionLabel(currentValueSelect));
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Backspace') {
            if (!inputValue && valueSelect) {
              onSelectChange(null);
              setInputValue(getAnswerOptionLabel(valueSelect));
            }
          }
        }}
        autoHighlight
        sx={{
          maxWidth: !isTabled ? textFieldWidth : 3000,
          minWidth: 160,
          flexGrow: 1
        }}
        size="small"
        disabled={readOnly && readOnlyVisualStyle === 'disabled'}
        readOnly={readOnly && readOnlyVisualStyle === 'readonly'}
        renderInput={(params) => {
          // Merge instructionsId with any existing aria-describedby from Autocomplete
          const existingAriaDescribedBy = params.inputProps?.['aria-describedby'];
          const mergedAriaDescribedBy = [existingAriaDescribedBy, instructionsId]
            .filter(Boolean)
            .join(' ');

          return (
            <StandardTextField
              multiline
              textFieldWidth={textFieldWidth}
              isTabled={isTabled}
              placeholder={valueSelect ? undefined : entryFormat || displayPrompt}
              {...params}
              slotProps={{
                input: {
                  ...params.InputProps,
                  readOnly: readOnly && readOnlyVisualStyle === 'readonly',
                  endAdornment: (
                    <>
                      {params.InputProps.endAdornment}
                      <ExpressionUpdateFadingIcon fadeIn={expressionUpdated} disabled={readOnly} />
                      <DisplayUnitText readOnly={readOnly}>{displayUnit}</DisplayUnitText>
                    </>
                  )
                },
                htmlInput: {
                  ...params.inputProps,
                  ...(isTabled
                    ? { 'aria-label': qItem.text ?? 'Unnamed choice dropdown' }
                    : { 'aria-labelledby': `label-${qItem.linkId}` }),
                  ...(mergedAriaDescribedBy && { 'aria-describedby': mergedAriaDescribedBy }),
                  role: 'combobox'
                }
              }}
            />
          );
        }}
        renderOption={(optionProps, option) => {
          const { key, ...rest } = optionProps;
          return (
            <li key={key} {...rest}>
              <span>
                {option.valueString ? (
                  <StyledText
                    textToDisplay={getAnswerOptionLabel(option)}
                    element={option._valueString}
                  />
                ) : (
                  getAnswerOptionLabel(option)
                )}
              </span>
            </li>
          );
        }}
      />

      {feedback ? <StyledRequiredTypography>{feedback}</StyledRequiredTypography> : null}
    </>
  );
}

export default ChoiceSelectAnswerOptionFields;
