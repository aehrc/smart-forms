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

import { getAnswerOptionLabel } from '../../../utils/openChoice';
import { StandardTextField } from '../Textfield.styles';
import Autocomplete from '@mui/material/Autocomplete';
import type { QuestionnaireItemAnswerOption } from 'fhir/r4';
import type { PropsWithIsTabledRequiredAttribute } from '../../../interfaces/renderProps.interface';
import { useRendererStylingStore } from '../../../stores';

interface QuantityUnitFieldProps extends PropsWithIsTabledRequiredAttribute {
  linkId: string;
  itemType: string;
  options: QuestionnaireItemAnswerOption[];
  valueSelect: QuestionnaireItemAnswerOption | null;
  readOnly: boolean;
  calcExpUpdated: boolean;
  onChange: (newValue: QuestionnaireItemAnswerOption | null) => void;
}

function QuantityUnitField(props: QuantityUnitFieldProps) {
  const { linkId, itemType, options, valueSelect, readOnly, isTabled, onChange } = props;
  // TODO this component doesn't have a calcExpUpdated update animation

  const readOnlyVisualStyle = useRendererStylingStore.use.readOnlyVisualStyle();
  const textFieldWidth = useRendererStylingStore.use.textFieldWidth();

  return (
    <Autocomplete
      id={itemType + '-' + linkId + '-unit'}
      value={valueSelect ?? null}
      isOptionEqualToValue={(option, value) =>
        option.valueCoding?.code === value?.valueCoding?.code
      }
      options={options}
      getOptionLabel={(option) => getAnswerOptionLabel(option)}
      onChange={(_, newValue) => onChange(newValue as QuestionnaireItemAnswerOption | null)}
      autoHighlight
      sx={{ maxWidth: !isTabled ? textFieldWidth : 3000, minWidth: 160, flexGrow: 1 }}
      disabled={readOnly && readOnlyVisualStyle === 'disabled'}
      readOnly={readOnly && readOnlyVisualStyle === 'readonly'}
      size="small"
      renderInput={(params) => (
        <StandardTextField
          data-test="q-item-unit-field"
          textFieldWidth={textFieldWidth}
          isTabled={isTabled}
          {...params}
        />
      )}
    />
  );
}

export default QuantityUnitField;
