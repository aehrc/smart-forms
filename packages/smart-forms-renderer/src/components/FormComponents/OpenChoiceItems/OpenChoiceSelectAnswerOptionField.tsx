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
import { getAnswerOptionLabel } from '../../../utils/openChoice';
import { StandardTextField } from '../Textfield.styles';
import type { AutocompleteChangeReason } from '@mui/material/Autocomplete';
import Autocomplete from '@mui/material/Autocomplete';
import type { QuestionnaireItem, QuestionnaireItemAnswerOption } from 'fhir/r4';
import type {
  PropsWithIsTabledAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithRenderingExtensionsAttribute
} from '../../../interfaces/renderProps.interface';
import { useRendererConfigStore } from '../../../stores';
import { StyledRequiredTypography } from '../Item.styles';
import DisplayUnitText from '../ItemParts/DisplayUnitText';
import ExpressionUpdateFadingIcon from '../ItemParts/ExpressionUpdateFadingIcon';
import StyledText from '../ItemParts/StyledText';

interface OpenChoiceSelectAnswerOptionFieldProps
  extends PropsWithIsTabledAttribute,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithRenderingExtensionsAttribute {
  qItem: QuestionnaireItem;
  options: QuestionnaireItemAnswerOption[];
  valueSelect: QuestionnaireItemAnswerOption | null;
  feedback: string;
  readOnly: boolean;
  calcExpUpdated: boolean;
  onValueChange: (
    newValue: QuestionnaireItemAnswerOption | string | null,
    reason: AutocompleteChangeReason | string
  ) => void;
}

function OpenChoiceSelectAnswerOptionField(props: OpenChoiceSelectAnswerOptionFieldProps) {
  const {
    qItem,
    options,
    valueSelect,
    feedback,
    readOnly,
    calcExpUpdated,
    isTabled,
    renderingExtensions,
    onValueChange
  } = props;

  const readOnlyVisualStyle = useRendererConfigStore.use.readOnlyVisualStyle();
  const textFieldWidth = useRendererConfigStore.use.textFieldWidth();

  const { displayUnit, displayPrompt, entryFormat } = renderingExtensions;

  const [inputValue, setInputValue] = React.useState('');

  return (
    <>
      <Autocomplete
        id={qItem.type + '-' + qItem.linkId}
        value={valueSelect ?? null}
        options={options}
        getOptionLabel={(option) => getAnswerOptionLabel(option)}
        onChange={(_, newValue, reason) => onValueChange(newValue, reason)}
        inputValue={inputValue}
        onInputChange={(_, newInputValue, reason) => {
          if (!inputValue && valueSelect && reason !== 'clear') {
            // Convert current input value to be the current value plus additional input
            onValueChange(null, 'clear');
            setInputValue(getAnswerOptionLabel(valueSelect) + newInputValue);
          } else {
            setInputValue(newInputValue);
          }
        }}
        onBlur={() => {
          // Set value on blur if there is any current input
          if (inputValue) {
            onValueChange(inputValue, 'blur');
            setInputValue(''); // Clear input after blur
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Backspace') {
            if (!inputValue && valueSelect) {
              // Convert current selection to input value on backspace when input is empty
              onValueChange(null, 'clear');
              setInputValue(getAnswerOptionLabel(valueSelect));
            }
          }
        }}
        freeSolo
        autoHighlight
        sx={{
          maxWidth: !isTabled ? textFieldWidth : 3000,
          minWidth: 160,
          flexGrow: 1,
          '& .MuiAutocomplete-tag': {
            mx: 0
          }
        }}
        disabled={readOnly && readOnlyVisualStyle === 'disabled'}
        readOnly={readOnly && readOnlyVisualStyle === 'readonly'}
        size="small"
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
                    <ExpressionUpdateFadingIcon fadeIn={calcExpUpdated} disabled={readOnly} />
                    {params.InputProps.endAdornment}
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
          if (typeof value === 'string') return value;
          const selectedOption =
            typeof value !== 'string'
              ? options.find((opt) => opt.valueString === value?.valueString)
              : null;

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { onDelete, ...rest } = getItemProps();
          return (
            <span {...rest}>
              {typeof value !== 'string' && value.valueString && selectedOption ? (
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

export default OpenChoiceSelectAnswerOptionField;
