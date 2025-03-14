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
import { StandardTextField } from '../Textfield.styles';
import { StyledAlert } from '../../Alert.styles';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Typography from '@mui/material/Typography';
import type { Coding, QuestionnaireItem } from 'fhir/r4';
import type {
  PropsWithIsTabledAttribute,
  PropsWithRenderingExtensionsAttribute
} from '../../../interfaces/renderProps.interface';
import type { TerminologyError } from '../../../hooks/useValueSetCodings';
import FadingCheckIcon from '../ItemParts/FadingCheckIcon';
import { useRendererStylingStore } from '../../../stores';
import { StyledRequiredTypography } from '../Item.styles';

interface ChoiceSelectAnswerValueSetFieldsProps
  extends PropsWithIsTabledAttribute,
    PropsWithRenderingExtensionsAttribute {
  qItem: QuestionnaireItem;
  codings: Coding[];
  valueCoding: Coding | null;
  terminologyError: TerminologyError;
  feedback: string;
  readOnly: boolean;
  calcExpUpdated: boolean;
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
    calcExpUpdated,
    isTabled,
    renderingExtensions,
    onSelectChange
  } = props;

  const textFieldWidth = useRendererStylingStore.use.textFieldWidth();

  const { displayUnit, displayPrompt, entryFormat } = renderingExtensions;

  if (codings.length > 0) {
    return (
      <>
        <Autocomplete
          id={qItem.type + '-' + qItem.linkId}
          options={codings}
          getOptionLabel={(option) => option.display ?? `${option.code}`}
          value={valueCoding ?? null}
          onChange={(_, newValue) => onSelectChange(newValue)}
          openOnFocus
          autoHighlight
          sx={{ maxWidth: !isTabled ? textFieldWidth : 3000, minWidth: 160, flexGrow: 1 }}
          size="small"
          disabled={readOnly}
          renderInput={(params) => (
            <StandardTextField
              textFieldWidth={textFieldWidth}
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
                    <Typography color={readOnly ? 'text.disabled' : 'text.secondary'}>
                      {displayUnit}
                    </Typography>
                  </>
                )
              }}
              data-test="q-item-choice-select-answer-value-set-field"
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
        <Typography>
          There was an error fetching options from the terminology server for{' '}
          {terminologyError.answerValueSet}
        </Typography>
      </StyledAlert>
    );
  }

  return (
    <StyledAlert color="error">
      <ErrorOutlineIcon color="error" sx={{ pr: 0.75 }} />
      <Typography>Unable to fetch options from the questionnaire or launch context</Typography>
    </StyledAlert>
  );
}

export default ChoiceSelectAnswerValueSetFields;
