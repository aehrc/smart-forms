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
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import type { QuestionnaireItem, QuestionnaireItemAnswerOption } from 'fhir/r4';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import type { PropsWithIsTabledAttribute } from '../../../interfaces/renderProps.interface';
import { TEXT_FIELD_WIDTH } from '../Textfield.styles';

interface ChoiceSelectAnswerOptionFieldsProps extends PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  options: QuestionnaireItemAnswerOption[];
  valueSelect: string;
  readOnly: boolean;
  calcExpUpdated: boolean;
  onSelectChange: (newValue: string) => void;
}

function ChoiceSelectAnswerOptionFields(props: ChoiceSelectAnswerOptionFieldsProps) {
  const { qItem, options, valueSelect, readOnly, calcExpUpdated, isTabled, onSelectChange } = props;

  const { displayUnit, displayPrompt, entryFormat } = useRenderingExtensions(qItem);

  // TODO use calcExpUpdated as updated feedback

  return (
    <Select
      id={qItem.id}
      name={qItem.text}
      value={valueSelect}
      disabled={readOnly}
      fullWidth
      placeholder={entryFormat}
      label={displayPrompt}
      endAdornment={<InputAdornment position="end">{displayUnit}</InputAdornment>}
      sx={{ maxWidth: !isTabled ? TEXT_FIELD_WIDTH : 3000, minWidth: 160 }}
      size="small"
      onChange={(e) => onSelectChange(e.target.value)}>
      {options.map((option, index) => {
        if (option['valueCoding']) {
          return (
            <MenuItem key={option.valueCoding.code} value={option.valueCoding.code}>
              {option.valueCoding.display ?? option.valueCoding.code}
            </MenuItem>
          );
        }

        if (option['valueString']) {
          return (
            <MenuItem key={option.valueString} value={option.valueString}>
              {option.valueString}
            </MenuItem>
          );
        }

        if (option['valueInteger']) {
          return (
            <MenuItem key={option.valueInteger} value={option.valueInteger.toString()}>
              {option.valueInteger}
            </MenuItem>
          );
        }

        return <Fragment key={index} />;
      })}
    </Select>
  );
}

export default ChoiceSelectAnswerOptionFields;
