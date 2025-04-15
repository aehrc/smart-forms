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
import type {
  PropsWithIsTabledRequiredAttribute,
  PropsWithRenderingExtensionsAttribute
} from '../../../interfaces/renderProps.interface';
import { StandardTextField } from '../Textfield.styles';
import FadingCheckIcon from '../ItemParts/FadingCheckIcon';
import Autocomplete from '@mui/material/Autocomplete';
import { getAnswerOptionLabel } from '../../../utils/openChoice';
import { compareAnswerOptionValue, isOptionDisabled } from '../../../utils/choice';
import { useRendererStylingStore } from '../../../stores';
import { StyledRequiredTypography } from '../Item.styles';
import DisplayUnitText from '../ItemParts/DisplayUnitText';
import useAnswerOptionsToggleExpressions from '../../../hooks/useAnswerOptionsToggleExpressions';

interface ChoiceSelectAnswerOptionFieldsProps
  extends PropsWithIsTabledRequiredAttribute,
    PropsWithRenderingExtensionsAttribute {
  qItem: QuestionnaireItem;
  options: QuestionnaireItemAnswerOption[];
  valueSelect: QuestionnaireItemAnswerOption | null;
  feedback: string;
  readOnly: boolean;
  calcExpUpdated: boolean;
  onSelectChange: (newValue: QuestionnaireItemAnswerOption | null) => void;
}

function ChoiceSelectAnswerOptionFields(props: ChoiceSelectAnswerOptionFieldsProps) {
  const {
    qItem,
    options,
    valueSelect,
    feedback,
    readOnly,
    calcExpUpdated,
    isTabled,
    renderingExtensions,
    onSelectChange
  } = props;

  const readOnlyVisualStyle = useRendererStylingStore.use.readOnlyVisualStyle();
  const textFieldWidth = useRendererStylingStore.use.textFieldWidth();

  const answerOptionsToggleExpressionsMap = useAnswerOptionsToggleExpressions(qItem, options);

  const { displayUnit, displayPrompt, entryFormat } = renderingExtensions;

  return (
    <>
      <Autocomplete
        id={qItem.type + '-' + qItem.linkId}
        value={valueSelect ?? null}
        options={options}
        getOptionDisabled={(option) => isOptionDisabled(option, answerOptionsToggleExpressionsMap)}
        getOptionLabel={(option) => getAnswerOptionLabel(option)}
        isOptionEqualToValue={(option, value) => compareAnswerOptionValue(option, value)}
        onChange={(_, newValue) => onSelectChange(newValue)}
        openOnFocus
        autoHighlight
        sx={{ maxWidth: !isTabled ? textFieldWidth : 3000, minWidth: 160, flexGrow: 1 }}
        size="small"
        disabled={readOnly && readOnlyVisualStyle === 'disabled'}
        readOnly={readOnly && readOnlyVisualStyle === 'readonly'}
        renderInput={(params) => (
          <StandardTextField
            textFieldWidth={textFieldWidth}
            isTabled={isTabled}
            label={displayPrompt}
            placeholder={entryFormat}
            {...params}
            slotProps={{
              input: {
                ...params.InputProps,
                readOnly: readOnly && readOnlyVisualStyle === 'readonly',
                endAdornment: (
                  <>
                    {params.InputProps.endAdornment}
                    <FadingCheckIcon fadeIn={calcExpUpdated} disabled={readOnly} />
                    <DisplayUnitText readOnly={readOnly}>{displayUnit}</DisplayUnitText>
                  </>
                )
              }
            }}
          />
        )}
      />

      {feedback ? <StyledRequiredTypography>{feedback}</StyledRequiredTypography> : null}
    </>
  );
}

export default ChoiceSelectAnswerOptionFields;
