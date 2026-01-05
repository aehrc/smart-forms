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

import Autocomplete from '@mui/material/Autocomplete';
import type { QuestionnaireItem, QuestionnaireItemAnswerOption } from 'fhir/r4';
import type {
  PropsWithIsTabledAttribute,
  PropsWithRenderingExtensionsAttribute
} from '../../../interfaces/renderProps.interface';
import { useRendererConfigStore } from '../../../stores';
import { compareAnswerOptionValue, isOptionDisabled } from '../../../utils/choice';
import { getAnswerOptionLabel } from '../../../utils/openChoice';
import { StyledRequiredTypography } from '../Item.styles';
import DisplayUnitText from '../ItemParts/DisplayUnitText';
import ExpressionUpdateFadingIcon from '../ItemParts/ExpressionUpdateFadingIcon';
import { StandardTextField } from '../Textfield.styles';

interface ChoiceSelectAnswerOptionFieldsProps
  extends PropsWithIsTabledAttribute,
    PropsWithRenderingExtensionsAttribute {
  qItem: QuestionnaireItem;
  options: QuestionnaireItemAnswerOption[];
  valueSelect: QuestionnaireItemAnswerOption | null;
  feedback: string;
  readOnly: boolean;
  expressionUpdated: boolean;
  answerOptionsToggleExpressionsMap: Map<string, boolean>;
  onSelectChange: (newValue: QuestionnaireItemAnswerOption | null) => void;
}

function ChoiceSelectAnswerOptionFields(props: ChoiceSelectAnswerOptionFieldsProps) {
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
    onSelectChange
  } = props;

  const readOnlyVisualStyle = useRendererConfigStore.use.readOnlyVisualStyle();
  const textFieldWidth = useRendererConfigStore.use.textFieldWidth();

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
        autoHighlight
        sx={{ maxWidth: !isTabled ? textFieldWidth : 3000, minWidth: 160, flexGrow: 1 }}
        size="small"
        disabled={readOnly && readOnlyVisualStyle === 'disabled'}
        readOnly={readOnly && readOnlyVisualStyle === 'readonly'}
        renderInput={(params) => (
          <StandardTextField
            textFieldWidth={textFieldWidth}
            isTabled={isTabled}
            placeholder={entryFormat || displayPrompt}
            {...params}
            slotProps={{
              input: {
                ...params.InputProps,
                readOnly: readOnly && readOnlyVisualStyle === 'readonly',
                endAdornment: (
                  <>
                    {params.InputProps.endAdornment}
                    <ExpressionUpdateFadingIcon fadeIn={expressionUpdated} disabled={readOnly} />
                    <DisplayUnitText readOnly={readOnly}>{displayUnit}</DisplayUnitText>
                  </>
                ),
                inputProps: {
                  ...params.inputProps,
                  ...(isTabled
                    ? { 'aria-label': qItem.text ?? 'Unnamed choice dropdown' }
                    : { 'aria-labelledby': `label-${qItem.linkId}` }),
                  role: 'combobox'
                }
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
