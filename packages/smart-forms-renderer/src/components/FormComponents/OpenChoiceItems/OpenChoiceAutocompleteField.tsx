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
import type { AutocompleteChangeReason } from '@mui/material/Autocomplete';
import Autocomplete from '@mui/material/Autocomplete';
import { StandardTextField } from '../Textfield.styles';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';
import Tooltip from '@mui/material/Tooltip';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
// @ts-ignore: Module has no declaration file. Not sure why WarningAmber.d.ts is not present in MUI icons 7.0.2
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DoneIcon from '@mui/icons-material/Done';
import ErrorIcon from '@mui/icons-material/Error';
import type { Coding, QuestionnaireItem } from 'fhir/r4';
import type {
  PropsWithIsTabledAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithRenderingExtensionsAttribute
} from '../../../interfaces/renderProps.interface';
import type { AlertColor } from '@mui/material/Alert';
import { useRendererConfigStore } from '../../../stores';
import DisplayUnitText from '../ItemParts/DisplayUnitText';
import ExpressionUpdateFadingIcon from '../ItemParts/ExpressionUpdateFadingIcon';

interface OpenChoiceAutocompleteFieldProps
  extends PropsWithIsTabledAttribute,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithRenderingExtensionsAttribute {
  qItem: QuestionnaireItem;
  options: Coding[];
  valueAutocomplete: string | Coding;
  input: string;
  loading: boolean;
  feedback: { message: string; color: AlertColor } | null;
  readOnly: boolean;
  calcExpUpdated: boolean;
  onValueChange: (
    newValue: Coding | string | null,
    reason: AutocompleteChangeReason | string
  ) => void;
}

function OpenChoiceAutocompleteField(props: OpenChoiceAutocompleteFieldProps) {
  const {
    qItem,
    options,
    valueAutocomplete,
    input,
    loading,
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

  return (
    <Autocomplete
      {...(!isTabled && { id: `${qItem.type}-${qItem.linkId}` })}
      value={valueAutocomplete}
      options={options}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : (option.display ?? `${option.code}`)
      }
      disabled={readOnly && readOnlyVisualStyle === 'disabled'}
      readOnly={readOnly && readOnlyVisualStyle === 'readonly'}
      loading={loading}
      loadingText={'Fetching results...'}
      clearOnEscape
      freeSolo
      sx={{ maxWidth: !isTabled ? textFieldWidth : 3000, minWidth: 220, flexGrow: 1 }}
      onChange={(_, newValue, reason) => onValueChange(newValue, reason)}
      onInputChange={(_, newValue, reason) => onValueChange(newValue, reason)}
      filterOptions={(x) => x}
      renderInput={(params) => (
        <StandardTextField
          {...params}
          multiline
          value={input}
          textFieldWidth={textFieldWidth}
          isTabled={isTabled}
          size="small"
          placeholder={entryFormat || displayPrompt}
          slotProps={{
            input: {
              ...params.InputProps,
              readOnly: readOnly && readOnlyVisualStyle === 'readonly',
              startAdornment: (
                <>
                  {!valueAutocomplete || valueAutocomplete === '' ? (
                    <SearchIcon fontSize="small" sx={{ ml: 0.5 }} />
                  ) : null}
                  {params.InputProps.startAdornment}
                </>
              ),
              // Warning indicator should not show up in open-choice autocomplete
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={16} />
                  ) : feedback && feedback.color !== 'warning' ? (
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
                  ) : null}
                  <ExpressionUpdateFadingIcon fadeIn={calcExpUpdated} disabled={readOnly} />
                  {params.InputProps.endAdornment}
                  <DisplayUnitText readOnly={readOnly}>{displayUnit}</DisplayUnitText>
                </>
              ),
              inputProps: {
                ...params.inputProps,
                ...(isTabled ? {} : { 'aria-label': qItem.text ?? `Unnamed ${qItem.type} item` })
              }
            }
          }}
          data-test="q-item-open-choice-autocomplete-field"
        />
      )}
    />
  );
}

export default OpenChoiceAutocompleteField;
