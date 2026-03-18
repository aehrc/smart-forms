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
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import type { QuestionnaireItem, QuestionnaireItemAnswerOption } from 'fhir/r4';
import type {
  PropsWithIsTabledAttribute,
  PropsWithRenderingExtensionsAttribute
} from '../../../interfaces/renderProps.interface';
import { useRendererConfigStore } from '../../../stores';
import { isOptionDisabled } from '../../../utils/choice';
import { getAnswerOptionLabel } from '../../../utils/openChoice';
import { StyledRequiredTypography } from '../Item.styles';
import DisplayUnitText from '../ItemParts/DisplayUnitText';
import ExpressionUpdateFadingIcon from '../ItemParts/ExpressionUpdateFadingIcon';
import Box from '@mui/material/Box';
import StyledText from '../ItemParts/StyledText';

interface CustomChoiceSelectFieldProps
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

function CustomChoiceSelectField(props: CustomChoiceSelectFieldProps) {
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

  const { displayUnit, displayPrompt } = renderingExtensions;

  // Convert QuestionnaireItemAnswerOption to a string key for Select value
  const getOptionKey = (option: QuestionnaireItemAnswerOption | null): string => {
    if (!option) return '';
    if (option.valueCoding) {
      return `coding-${option.valueCoding.system || ''}-${option.valueCoding.code || ''}`;
    }
    if (option.valueInteger !== undefined) {
      return `integer-${option.valueInteger}`;
    }
    if (option.valueString) {
      return `string-${option.valueString}`;
    }
    return '';
  };

  // Find option by key
  const findOptionByKey = (key: string): QuestionnaireItemAnswerOption | null => {
    if (!key) return null;
    return options.find((opt) => getOptionKey(opt) === key) || null;
  };

  const selectedKey = getOptionKey(valueSelect);

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        sx={{ maxWidth: !isTabled ? textFieldWidth : 3000, minWidth: 160 }}>
        <div
          role="group"
          {...(!isTabled && { 'aria-labelledby': `label-${qItem.linkId}` })}
          {...(isTabled && { 'aria-label': qItem.text ?? 'Unnamed choice dropdown' })}
          {...(instructionsId && { 'aria-describedby': instructionsId })}
          style={{ flexGrow: 1 }}>
          <FormControl fullWidth size="small" error={!!feedback}>
            <Select
              id={qItem.type + '-' + qItem.linkId}
              value={selectedKey}
              displayEmpty
              disabled={readOnly && readOnlyVisualStyle === 'disabled'}
              readOnly={readOnly && readOnlyVisualStyle === 'readonly'}
              {...(!isTabled && { 'aria-labelledby': `label-${qItem.linkId}` })}
              {...(isTabled && { 'aria-label': qItem.text ?? 'Unnamed choice dropdown' })}
              {...(instructionsId && { 'aria-describedby': instructionsId })}
              MenuProps={{
                disableAutoFocusItem: true
              }}
              onChange={(e) => {
                const newOption = findOptionByKey(e.target.value);
                onSelectChange(newOption);
              }}
              renderValue={(value) => {
                if (!value) {
                  return <span style={{ color: '#999' }}>{displayPrompt || 'Select...'}</span>;
                }
                const option = findOptionByKey(value);
                if (!option) return '';

                if (option.valueString) {
                  return (
                    <StyledText
                      textToDisplay={getAnswerOptionLabel(option)}
                      element={option._valueString}
                    />
                  );
                }
                return getAnswerOptionLabel(option);
              }}>
              {displayPrompt && (
                <MenuItem value="" disabled>
                  <span style={{ color: '#999' }}>{displayPrompt}</span>
                </MenuItem>
              )}
              {options.map((option) => {
                const optionKey = getOptionKey(option);
                const disabled = isOptionDisabled(option, answerOptionsToggleExpressionsMap);
                const label = getAnswerOptionLabel(option);

                return (
                  <MenuItem key={optionKey} value={optionKey} disabled={disabled}>
                    {option.valueString ? (
                      <StyledText textToDisplay={label} element={option._valueString} />
                    ) : (
                      label
                    )}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </div>
        <ExpressionUpdateFadingIcon fadeIn={expressionUpdated} disabled={readOnly} />
        <DisplayUnitText readOnly={readOnly}>{displayUnit}</DisplayUnitText>
      </Box>

      {feedback ? <StyledRequiredTypography>{feedback}</StyledRequiredTypography> : null}
    </>
  );
}

export default CustomChoiceSelectField;
