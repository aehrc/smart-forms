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

import React, { useState } from 'react';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import type { Coding, QuestionnaireItem } from 'fhir/r4';
import type {
  PropsWithIsTabledAttribute,
  PropsWithRenderingExtensionsAttribute
} from '../../../interfaces/renderProps.interface';
import type { AlertColor } from '@mui/material/Alert';
import { useRendererConfigStore } from '../../../stores';
import { StandardTextField } from '../Textfield.styles';
import DisplayUnitText from '../ItemParts/DisplayUnitText';
import ExpressionUpdateFadingIcon from '../ItemParts/ExpressionUpdateFadingIcon';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';
// @ts-ignore: Module has no declaration file. Not sure why WarningAmber.d.ts is not present in MUI icons 7.0.2
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DoneIcon from '@mui/icons-material/Done';
import ErrorIcon from '@mui/icons-material/Error';

interface CustomOpenChoiceFieldProps
  extends PropsWithIsTabledAttribute,
    PropsWithRenderingExtensionsAttribute {
  qItem: QuestionnaireItem;
  options: Coding[];
  valueAutocomplete: string | Coding;
  loading: boolean;
  feedback: { message: string; color: AlertColor } | null;
  readOnly: boolean;
  calcExpUpdated: boolean;
  instructionsId: string | undefined;
  onValueChange: (newValue: Coding | string | null, reason: string) => void;
}

const CUSTOM_VALUE_KEY = '__custom__';

function CustomOpenChoiceField(props: CustomOpenChoiceFieldProps) {
  const {
    qItem,
    options,
    valueAutocomplete,
    loading,
    feedback,
    readOnly,
    calcExpUpdated,
    isTabled,
    renderingExtensions,
    instructionsId,
    onValueChange
  } = props;

  const readOnlyVisualStyle = useRendererConfigStore.use.readOnlyVisualStyle();
  const textFieldWidth = useRendererConfigStore.use.textFieldWidth();

  const { displayUnit, displayPrompt } = renderingExtensions;

  // Determine if current value is a custom string or a predefined Coding
  const isCustomValue =
    typeof valueAutocomplete === 'string' &&
    valueAutocomplete !== '' &&
    !options.find((opt) => opt.display === valueAutocomplete || opt.code === valueAutocomplete);

  const [showCustomInput, setShowCustomInput] = useState(isCustomValue);
  const [customText, setCustomText] = useState(
    typeof valueAutocomplete === 'string' ? valueAutocomplete : ''
  );

  // Convert Coding to a string key for Select value
  const getCodingKey = (coding: Coding | null | undefined): string => {
    if (!coding) return '';
    return `${coding.system || ''}-${coding.code || ''}`;
  };

  // Find Coding by key
  const findCodingByKey = (key: string): Coding | null => {
    if (!key || key === CUSTOM_VALUE_KEY) return null;
    return options.find((opt) => getCodingKey(opt) === key) || null;
  };

  // Get current select value
  const getSelectValue = (): string => {
    if (showCustomInput) return CUSTOM_VALUE_KEY;
    if (typeof valueAutocomplete === 'object' && valueAutocomplete) {
      if (valueAutocomplete.code) {
        const key = getCodingKey(valueAutocomplete);
        // Verify the key exists in options
        if (findCodingByKey(key)) {
          return key;
        }
      }
    }
    return '';
  };

  const selectedKey = getSelectValue();

  const handleSelectChange = (key: string) => {
    if (key === CUSTOM_VALUE_KEY) {
      setShowCustomInput(true);
      setCustomText('');
      onValueChange('', 'select');
    } else {
      setShowCustomInput(false);
      const coding = findCodingByKey(key);
      onValueChange(coding, 'selectOption');
    }
  };

  const handleCustomTextChange = (text: string) => {
    setCustomText(text);
    onValueChange(text, 'input');
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={1}
      sx={{ maxWidth: !isTabled ? textFieldWidth : 3000, minWidth: 220, flexGrow: 1 }}>
      <Box display="flex" alignItems="center" gap={1}>
        <FormControl fullWidth size="small" error={!!feedback && feedback.color === 'error'}>
          <Select
            id={`${qItem.type}-${qItem.linkId}`}
            value={selectedKey}
            displayEmpty
            disabled={readOnly && readOnlyVisualStyle === 'disabled'}
            readOnly={readOnly && readOnlyVisualStyle === 'readonly'}
            {...(!isTabled && { 'aria-labelledby': `label-${qItem.linkId}` })}
            {...(isTabled && { 'aria-label': qItem.text ?? 'Unnamed open-choice dropdown' })}
            {...(instructionsId && { 'aria-describedby': instructionsId })}
            MenuProps={{
              disableAutoFocusItem: true
            }}
            onChange={(e) => handleSelectChange(e.target.value)}
            renderValue={(value) => {
              if (value === CUSTOM_VALUE_KEY) {
                return <span>Custom value...</span>;
              }
              if (!value) {
                return <span style={{ color: '#999' }}>{displayPrompt || 'Select...'}</span>;
              }
              const coding = findCodingByKey(value);
              return coding?.display ?? coding?.code ?? '';
            }}
            data-test="q-item-open-choice-select">
            {displayPrompt && (
              <MenuItem value="" disabled>
                <span style={{ color: '#999' }}>{displayPrompt}</span>
              </MenuItem>
            )}
            {options.map((coding) => {
              const codingKey = getCodingKey(coding);
              return (
                <MenuItem key={codingKey} value={codingKey}>
                  {coding.display ?? coding.code}
                </MenuItem>
              );
            })}
            <MenuItem value={CUSTOM_VALUE_KEY}>
              <em>Enter custom value...</em>
            </MenuItem>
          </Select>
        </FormControl>
        {loading && <CircularProgress size={20} />}
        <ExpressionUpdateFadingIcon fadeIn={calcExpUpdated} disabled={readOnly} />
        <DisplayUnitText readOnly={readOnly}>{displayUnit}</DisplayUnitText>
      </Box>

      {showCustomInput && (
        <StandardTextField
          value={customText}
          onChange={(e) => handleCustomTextChange(e.target.value)}
          placeholder="Enter custom value"
          size="small"
          disabled={readOnly && readOnlyVisualStyle === 'disabled'}
          textFieldWidth={textFieldWidth}
          isTabled={isTabled}
          error={!!feedback && feedback.color === 'error'}
          slotProps={{
            input: {
              readOnly: readOnly && readOnlyVisualStyle === 'readonly',
              endAdornment:
                feedback && feedback.color !== 'warning' ? (
                  <Fade in={!!feedback} timeout={300}>
                    <Tooltip title={feedback.message} arrow sx={{ ml: 1 }}>
                      {
                        {
                          info: <InfoIcon fontSize="small" color="info" />,
                          warning: <WarningAmberIcon fontSize="small" color="warning" />,
                          success: <DoneIcon fontSize="small" color="success" />,
                          error: <ErrorIcon fontSize="small" color="error" />
                        }[feedback.color]
                      }
                    </Tooltip>
                  </Fade>
                ) : null
            },
            htmlInput: {
              'aria-label': isTabled
                ? `${qItem.text ?? 'Unnamed open-choice'} custom value`
                : (qItem.text ?? 'Unnamed open-choice custom value'),
              ...(instructionsId && { 'aria-describedby': instructionsId })
            }
          }}
          data-test="q-item-open-choice-custom-input"
        />
      )}
    </Box>
  );
}

export default CustomOpenChoiceField;
