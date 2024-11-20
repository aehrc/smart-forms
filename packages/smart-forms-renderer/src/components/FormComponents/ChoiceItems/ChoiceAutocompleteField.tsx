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
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';
import Tooltip from '@mui/material/Tooltip';
import type { Coding, QuestionnaireItem } from 'fhir/r4';
import { StandardTextField } from '../Textfield.styles';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DoneIcon from '@mui/icons-material/Done';
import ErrorIcon from '@mui/icons-material/Error';
import type {
  PropsWithIsTabledAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithRenderingExtensionsAttribute
} from '../../../interfaces/renderProps.interface';
import type { AlertColor } from '@mui/material/Alert';
import { useRendererStylingStore } from '../../../stores';
import Typography from '@mui/material/Typography';

interface ChoiceAutocompleteFieldsProps
  extends PropsWithIsTabledAttribute,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithRenderingExtensionsAttribute {
  qItem: QuestionnaireItem;
  options: Coding[];
  valueCoding: Coding | null;
  loading: boolean;
  feedback: { message: string; color: AlertColor } | null;
  readOnly: boolean;
  onInputChange: (newInput: string) => void;
  onValueChange: (newValue: Coding | null) => void;
}

function ChoiceAutocompleteField(props: ChoiceAutocompleteFieldsProps) {
  const {
    qItem,
    options,
    valueCoding,
    loading,
    feedback,
    readOnly,
    isTabled,
    renderingExtensions,
    onInputChange,
    onValueChange
  } = props;

  const textFieldWidth = useRendererStylingStore.use.textFieldWidth();

  const { displayUnit, displayPrompt, entryFormat } = renderingExtensions;

  return (
    <Autocomplete
      id={qItem.linkId}
      value={valueCoding ?? null}
      options={options}
      getOptionLabel={(option) => option.display ?? `${option.code}`}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      disabled={readOnly}
      loading={loading}
      loadingText={'Fetching results...'}
      clearOnEscape
      autoHighlight
      onChange={(_, newValue) => onValueChange(newValue)}
      sx={{ maxWidth: !isTabled ? textFieldWidth : 3000, minWidth: 160, flexGrow: 1 }}
      filterOptions={(x) => x}
      renderInput={(params) => (
        <StandardTextField
          {...params}
          onChange={(e) => onInputChange(e.target.value)}
          textFieldWidth={textFieldWidth}
          isTabled={isTabled}
          label={displayPrompt}
          size="small"
          placeholder={entryFormat}
          InputProps={{
            ...params.InputProps,

            startAdornment: (
              <>
                {!valueCoding ? <SearchIcon fontSize="small" sx={{ ml: 0.5 }} /> : null}
                {params.InputProps.startAdornment}
              </>
            ),
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={16} />
                ) : feedback ? (
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
                <Typography color={readOnly ? 'text.disabled' : 'text.secondary'}>
                  {displayUnit}
                </Typography>
              </>
            )
          }}
        />
      )}
    />
  );
}

export default ChoiceAutocompleteField;
