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

import React, { Fragment } from 'react';
import type { QuestionnaireItem, QuestionnaireItemAnswerOption } from 'fhir/r4';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import type { PropsWithIsTabledAttribute } from '../../../interfaces/renderProps.interface';
import { StandardTextField, TEXT_FIELD_WIDTH } from '../Textfield.styles';
import FadingCheckIcon from '../ItemParts/FadingCheckIcon';
import Autocomplete from '@mui/material/Autocomplete';
import { getAnswerOptionLabel } from '../../../utils/openChoice';
import { compareAnswerOptionValue } from '../../../utils/choice';

interface ChoiceSelectAnswerOptionFieldsProps extends PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  options: QuestionnaireItemAnswerOption[];
  valueSelect: QuestionnaireItemAnswerOption | null;
  readOnly: boolean;
  calcExpUpdated: boolean;
  onSelectChange: (newValue: QuestionnaireItemAnswerOption | null) => void;
}

function ChoiceSelectAnswerOptionFields(props: ChoiceSelectAnswerOptionFieldsProps) {
  const { qItem, options, valueSelect, readOnly, calcExpUpdated, isTabled, onSelectChange } = props;

  const { displayUnit, displayPrompt, entryFormat } = useRenderingExtensions(qItem);

  return (
    <Autocomplete
      id={qItem.id}
      value={valueSelect ?? null}
      options={options}
      getOptionLabel={(option) => getAnswerOptionLabel(option)}
      isOptionEqualToValue={(option, value) => compareAnswerOptionValue(option, value)}
      onChange={(_, newValue) => onSelectChange(newValue)}
      openOnFocus
      autoHighlight
      sx={{ maxWidth: !isTabled ? TEXT_FIELD_WIDTH : 3000, minWidth: 160, flexGrow: 1 }}
      size="small"
      disabled={readOnly}
      renderInput={(params) => (
        <StandardTextField
          isTabled={isTabled}
          label={displayPrompt}
          placeholder={entryFormat}
          {...params}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {params.InputProps.endAdornment}
                <FadingCheckIcon fadeIn={calcExpUpdated} disabled={readOnly} />
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

export default ChoiceSelectAnswerOptionFields;
