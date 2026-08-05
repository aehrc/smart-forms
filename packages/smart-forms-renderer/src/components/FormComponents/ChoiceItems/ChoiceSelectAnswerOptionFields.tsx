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
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import type { QuestionnaireItem, QuestionnaireItemAnswerOption } from 'fhir/r4';
import type {
  PropsWithIsTabledAttribute,
  PropsWithRenderingExtensionsAttribute
} from '../../../interfaces/renderProps.interface';
import { useQuestionnaireStore, useRendererConfigStore } from '../../../stores';
import { compareAnswerOptionValue, isOptionDisabled } from '../../../utils/choice';
import { getAnswerOptionLabel } from '../../../utils/openChoice';
import DisplayUnitText from '../ItemParts/DisplayUnitText';
import ExpressionUpdateFadingIcon from '../ItemParts/ExpressionUpdateFadingIcon';
import { StandardTextField } from '../Textfield.styles';
import StyledText from '../ItemParts/StyledText';
import AccessibleFeedback from '../ItemParts/AccessibleFeedback';

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
  const answerOptionsLookupFailures = useQuestionnaireStore.use.answerOptionsLookupFailures();

  // Derive per-field failure flag and a label getter that shows [code] for any option
  // whose display couldn't be resolved, keeping successfully-resolved options unchanged.
  const hasLookupFailure = options.some(
    (opt) =>
      opt.valueCoding &&
      !opt.valueCoding.display &&
      answerOptionsLookupFailures.has(`${opt.valueCoding.system}|${opt.valueCoding.code}`)
  );

  function getLabelWithFallback(option: QuestionnaireItemAnswerOption | string): string {
    if (typeof option === 'string') return option;
    if (
      option.valueCoding &&
      !option.valueCoding.display &&
      answerOptionsLookupFailures.has(`${option.valueCoding.system}|${option.valueCoding.code}`)
    ) {
      return `[${option.valueCoding.code}]`;
    }
    return getAnswerOptionLabel(option);
  }

  const { displayUnit, displayPrompt, entryFormat } = renderingExtensions;

  const [inputValue, setInputValue] = React.useState('');

  // Keep track of current selected value when input is changed
  const [currentValueSelect, setCurrentValueSelect] =
    React.useState<QuestionnaireItemAnswerOption | null>(valueSelect);

  return (
    <FormControl
      error={!!feedback}
      sx={{
        width: '100%',
        maxWidth: !isTabled ? textFieldWidth : 3000,
        minWidth: 160,
        flexGrow: 1
      }}>
      <Autocomplete
        id={qItem.type + '-' + qItem.linkId}
        value={valueSelect ?? null}
        options={options}
        getOptionDisabled={(option) => isOptionDisabled(option, answerOptionsToggleExpressionsMap)}
        getOptionLabel={(option) => getLabelWithFallback(option)}
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
            setInputValue(getLabelWithFallback(valueSelect) + newInputValue);
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
              setInputValue(getLabelWithFallback(valueSelect));
            }
          }
        }}
        fullWidth
        autoHighlight
        sx={{ '& .MuiAutocomplete-tag': { mx: 0 } }}
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
              textFieldWidth={textFieldWidth}
              isTabled={isTabled}
              error={!!feedback}
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
                  ),
                  sx: {
                    '&.MuiOutlinedInput-root.MuiInputBase-sizeSmall .MuiAutocomplete-input': {
                      paddingLeft: '0px'
                    }
                  }
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
                    textToDisplay={getLabelWithFallback(option)}
                    element={option._valueString}
                  />
                ) : (
                  getLabelWithFallback(option)
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
            <span {...rest} style={{ paddingLeft: '8.5px' }}>
              {value.valueString && selectedOption ? (
                <StyledText
                  textToDisplay={getLabelWithFallback(value)}
                  element={selectedOption._valueString}
                />
              ) : (
                getLabelWithFallback(value)
              )}
            </span>
          );
        }}
      />

      {hasLookupFailure ? (
        <FormHelperText sx={{ color: 'warning.main' }}>
          <AccessibleFeedback>
            Some option labels could not be loaded — terminology server may be unavailable
          </AccessibleFeedback>
        </FormHelperText>
      ) : null}
      {feedback ? (
        <FormHelperText>
          <AccessibleFeedback>{feedback}</AccessibleFeedback>
        </FormHelperText>
      ) : null}
    </FormControl>
  );
}

export default ChoiceSelectAnswerOptionFields;
