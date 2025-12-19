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
    onSelectChange
  } = props;

  const readOnlyVisualStyle = useRendererConfigStore.use.readOnlyVisualStyle();
  const textFieldWidth = useRendererConfigStore.use.textFieldWidth();

  const { displayUnit, displayPrompt, entryFormat } = renderingExtensions;

  const [inputValue, setInputValue] = React.useState('');

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
        }}
        inputValue={inputValue}
        onInputChange={(_, newInputValue, reason) => {
          if (!inputValue && valueSelect && reason !== 'clear') {
            // Convert current input value to be the current value plus additional input
            onSelectChange(null);
            setInputValue(getAnswerOptionLabel(valueSelect) + newInputValue);
          } else {
            setInputValue(newInputValue);
          }
        }}
        onBlur={() => {
          // Set value on blur if there is any current input
          if (currentValueSelect) {
            onSelectChange(currentValueSelect);
            setInputValue(''); // Clear input after blur
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Backspace') {
            if (!inputValue && valueSelect) {
              // Convert current selection to input value on backspace when input is empty
              onSelectChange(null);
              setInputValue(getAnswerOptionLabel(valueSelect));
            }
          }
        }}
        autoHighlight
        sx={{
          maxWidth: !isTabled ? textFieldWidth : 3000,
          minWidth: 160,
          flexGrow: 1,
          '& .MuiAutocomplete-tag': {
            mx: 0
          }
        }}
        size="small"
        disabled={readOnly && readOnlyVisualStyle === 'disabled'}
        readOnly={readOnly && readOnlyVisualStyle === 'readonly'}
        renderInput={(params) => (
          <StandardTextField
            multiline
            textFieldWidth={textFieldWidth}
            isTabled={isTabled}
            placeholder={entryFormat || displayPrompt}
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
                ),
                sx: {
                  '&.MuiOutlinedInput-root.MuiInputBase-sizeSmall .MuiAutocomplete-input': {
                    paddingLeft: '0px'
                  }
                }
              }
            }}
          />
        )}
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
        renderValue={(value, getItemProps) => {
          const selectedOption = options.find((opt) => opt.valueString === value.valueString);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { onDelete, ...rest } = getItemProps();
          return (
            <span {...rest}>
              {value.valueString && selectedOption ? (
                <StyledText
                  textToDisplay={getAnswerOptionLabel(value)}
                  element={selectedOption._valueString}
                />
              ) : (
                getAnswerOptionLabel(value)
              )}
            </span>
          );
        }}
      />

      {feedback ? <StyledRequiredTypography>{feedback}</StyledRequiredTypography> : null}
    </>
  );
}

export default ChoiceSelectAnswerOptionFields;
