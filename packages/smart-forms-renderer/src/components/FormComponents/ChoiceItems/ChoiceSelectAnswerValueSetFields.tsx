/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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
import { StandardTextField } from '../Textfield.styles';
import { StyledAlert } from '../../Alert.styles';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Typography from '@mui/material/Typography';
import type { Coding, QuestionnaireItem } from 'fhir/r4';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import type { PropsWithIsTabledAttribute } from '../../../interfaces/renderProps.interface';
import { PropsWithParentIsReadOnlyAttribute } from '../../../interfaces/renderProps.interface';
import useReadOnly from '../../../hooks/useReadOnly';

interface ChoiceSelectAnswerValueSetFieldsProps
  extends PropsWithIsTabledAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  codings: Coding[];
  valueCoding: Coding | null;
  serverError: Error | null;
  onSelectChange: (newValue: Coding | null) => void;
}

function ChoiceSelectAnswerValueSetFields(props: ChoiceSelectAnswerValueSetFieldsProps) {
  const { qItem, codings, valueCoding, serverError, isTabled, parentIsReadOnly, onSelectChange } =
    props;

  const readOnly = useReadOnly(qItem, parentIsReadOnly);
  const { displayUnit, displayPrompt, entryFormat } = useRenderingExtensions(qItem);

  if (codings.length > 0) {
    return (
      <Autocomplete
        id={qItem.id}
        options={codings}
        getOptionLabel={(option) => `${option.display}`}
        value={valueCoding ?? null}
        onChange={(_, newValue) => onSelectChange(newValue)}
        openOnFocus
        autoHighlight
        sx={{ maxWidth: !isTabled ? 280 : 3000, minWidth: 160, flexGrow: 1 }}
        size="small"
        disabled={readOnly}
        placeholder={entryFormat}
        renderInput={(params) => (
          <StandardTextField
            isTabled={isTabled}
            label={displayPrompt}
            {...params}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {params.InputProps.endAdornment}
                  {displayUnit}
                </>
              )
            }}
            data-test="q-item-choice-dropdown-answer-value-set-field"
          />
        )}
      />
    );
  }

  if (serverError) {
    return (
      <StyledAlert color="error">
        <ErrorOutlineIcon color="error" sx={{ pr: 0.75 }} />
        <Typography variant="subtitle2">
          There was an error fetching options from the terminology server
        </Typography>
      </StyledAlert>
    );
  }

  return (
    <StyledAlert color="error">
      <ErrorOutlineIcon color="error" sx={{ pr: 0.75 }} />
      <Typography variant="subtitle2">
        Unable to fetch options from the questionnaire or launch context
      </Typography>
    </StyledAlert>
  );
}

export default ChoiceSelectAnswerValueSetFields;
