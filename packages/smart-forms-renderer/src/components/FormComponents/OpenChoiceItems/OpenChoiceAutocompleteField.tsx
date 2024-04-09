/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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
import Box from '@mui/material/Box';
import Autocomplete from '@mui/material/Autocomplete';
import { StandardTextField, TEXT_FIELD_WIDTH } from '../Textfield.styles';
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DoneIcon from '@mui/icons-material/Done';
import ErrorIcon from '@mui/icons-material/Error';
import type { Coding, QuestionnaireItem } from 'fhir/r4';
import type {
  PropsWithIsTabledAttribute,
  PropsWithParentIsReadOnlyAttribute
} from '../../../interfaces/renderProps.interface';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import type { AlertColor } from '@mui/material/Alert';

interface OpenChoiceAutocompleteFieldProps
  extends PropsWithIsTabledAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  options: Coding[];
  valueAutocomplete: string | Coding;
  input: string;
  loading: boolean;
  feedback: { message: string; color: AlertColor } | null;
  readOnly: boolean;
  onInputChange: (newInput: string) => void;
  onValueChange: (newValue: Coding | string | null) => void;
  onUnfocus: () => void;
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
    isTabled,
    onInputChange,
    onValueChange,
    onUnfocus
  } = props;

  const { displayUnit, displayPrompt, entryFormat } = useRenderingExtensions(qItem);

  return (
    <Box display="flex">
      <Autocomplete
        id={qItem.id}
        value={valueAutocomplete}
        options={options}
        getOptionLabel={(option) => (typeof option === 'string' ? option : `${option.display}`)}
        disabled={readOnly}
        loading={loading}
        loadingText={'Fetching results...'}
        clearOnEscape
        freeSolo
        sx={{ maxWidth: !isTabled ? TEXT_FIELD_WIDTH : 3000, minWidth: 220, flexGrow: 1 }}
        onChange={(_, newValue) => onValueChange(newValue)}
        filterOptions={(x) => x}
        renderInput={(params) => (
          <StandardTextField
            {...params}
            value={input}
            onBlur={onUnfocus}
            onChange={(e) => onInputChange(e.target.value)}
            isTabled={isTabled}
            label={displayPrompt}
            size="small"
            placeholder={entryFormat}
            InputProps={{
              ...params.InputProps,
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
                  {params.InputProps.endAdornment}
                  {displayUnit}
                </>
              )
            }}
            data-test="q-item-open-choice-autocomplete-field"
          />
        )}
      />
    </Box>
  );
}

export default OpenChoiceAutocompleteField;
