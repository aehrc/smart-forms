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
import { StandardTextField } from '../Textfield.styles';
import { StyledAlert } from '../../Alert.styles';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Typography from '@mui/material/Typography';
import type { Coding, QuestionnaireItem } from 'fhir/r4';
import type {
  PropsWithIsTabledRequiredAttribute,
  PropsWithRenderingExtensionsAttribute
} from '../../../interfaces/renderProps.interface';
import type { TerminologyError } from '../../../hooks/useValueSetCodings';
import { useRendererStylingStore } from '../../../stores';
import { StyledRequiredTypography } from '../Item.styles';
import DisplayUnitText from '../ItemParts/DisplayUnitText';
import { isCodingDisabled } from '../../../utils/choice';
import ExpressionUpdateFadingIcon from '../ItemParts/ExpressionUpdateFadingIcon';

interface ChoiceSelectAnswerValueSetFieldsProps
  extends PropsWithIsTabledRequiredAttribute,
    PropsWithRenderingExtensionsAttribute {
  qItem: QuestionnaireItem;
  codings: Coding[];
  valueCoding: Coding | null;
  terminologyError: TerminologyError;
  feedback: string;
  readOnly: boolean;
  expressionUpdated: boolean;
  answerOptionsToggleExpressionsMap: Map<string, boolean>;
  onSelectChange: (newValue: Coding | null) => void;
}

function ChoiceSelectAnswerValueSetFields(props: ChoiceSelectAnswerValueSetFieldsProps) {
  const {
    qItem,
    codings,
    valueCoding,
    terminologyError,
    feedback,
    readOnly,
    expressionUpdated,
    isTabled,
    renderingExtensions,
    answerOptionsToggleExpressionsMap,
    onSelectChange
  } = props;

  const readOnlyVisualStyle = useRendererStylingStore.use.readOnlyVisualStyle();
  const textFieldWidth = useRendererStylingStore.use.textFieldWidth();

  const { displayUnit, displayPrompt, entryFormat } = renderingExtensions;

  if (codings.length > 0) {
    return (
      <>
        <Autocomplete
          {...(!isTabled && { id: `${qItem.type}-${qItem.linkId}` })}
          options={codings}
          getOptionDisabled={(coding) =>
            isCodingDisabled(coding, answerOptionsToggleExpressionsMap)
          }
          getOptionLabel={(option) => option.display ?? `${option.code}`}
          value={valueCoding ?? null}
          onChange={(_, newValue) => onSelectChange(newValue)}
          openOnFocus
          autoHighlight
          sx={{ maxWidth: !isTabled ? textFieldWidth : 3000, minWidth: 160, flexGrow: 1 }}
          size="small"
          disabled={readOnly && readOnlyVisualStyle === 'disabled'}
          readOnly={readOnly && readOnlyVisualStyle === 'readonly'}
          renderInput={(params) => (
            <StandardTextField
              multiline
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
                    'aria-label': qItem.text ?? 'Unnamed choice dropdown'
                  }
                }
              }}
              data-test="q-item-choice-select-answer-value-set-field"
              data-linkid={qItem.linkId}
              data-label={qItem.text}
            />
          )}
        />

        {feedback ? <StyledRequiredTypography>{feedback}</StyledRequiredTypography> : null}
      </>
    );
  }

  if (terminologyError.error) {
    return (
      <StyledAlert color="error">
        <ErrorOutlineIcon color="error" sx={{ pr: 0.75 }} />
        <Typography component="div">
          There was an error fetching options from the terminology server for{' '}
          {terminologyError.answerValueSet}
        </Typography>
      </StyledAlert>
    );
  }

  if (codings.length === 0) {
    return (
      <Typography sx={{ py: 0.5 }} fontWeight={600} fontSize={13}>
        No options available.
      </Typography>
    );
  }

  return (
    <StyledAlert color="error">
      <ErrorOutlineIcon color="error" sx={{ pr: 0.75 }} />
      <Typography component="div">
        Unable to fetch options from the questionnaire or launch context
      </Typography>
    </StyledAlert>
  );
}

export default ChoiceSelectAnswerValueSetFields;
