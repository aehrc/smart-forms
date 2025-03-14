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

import type { ChangeEvent } from 'react';
import React from 'react';
import { ChoiceItemOrientation } from '../../../interfaces/choice.enum';
import type { QuestionnaireItem, QuestionnaireItemAnswerOption } from 'fhir/r4';
import { StyledRadioGroup, StyledRequiredTypography } from '../Item.styles';
import RadioButtonWithOpenLabel from '../ItemParts/RadioButtonWithOpenLabel';
import RadioOptionList from '../ItemParts/RadioOptionList';
import { getChoiceOrientation } from '../../../utils/choice';
import type { TerminologyError } from '../../../hooks/useValueSetCodings';
import { StyledAlert } from '../../Alert.styles';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Typography from '@mui/material/Typography';
import { useRendererStylingStore } from '../../../stores';

interface OpenChoiceRadioAnswerValueSetFieldsProps {
  qItem: QuestionnaireItem;
  options: QuestionnaireItemAnswerOption[];
  valueRadio: string | null;
  openLabelText: string | null;
  openLabelValue: string | null;
  openLabelSelected: boolean;
  feedback: string;
  readOnly: boolean;
  terminologyError: TerminologyError;
  onValueChange: (changedOptionValue: string | null, changedOpenLabelValue: string | null) => void;
}

function OpenChoiceRadioAnswerValueSetFields(props: OpenChoiceRadioAnswerValueSetFieldsProps) {
  const {
    qItem,
    options,
    valueRadio,
    openLabelText,
    openLabelValue,
    openLabelSelected,
    feedback,
    readOnly,
    terminologyError,
    onValueChange
  } = props;

  const inputsFlexGrow = useRendererStylingStore.use.inputsFlexGrow();

  const orientation = getChoiceOrientation(qItem) ?? ChoiceItemOrientation.Vertical;

  if (options.length > 0) {
    return (
      <>
        <StyledRadioGroup
          id={qItem.type + '-' + qItem.linkId}
          row={orientation === ChoiceItemOrientation.Horizontal}
          sx={inputsFlexGrow ? { width: '100%', flexWrap: 'nowrap' } : {}}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onValueChange(e.target.value, null)}
          value={valueRadio}
          data-test="q-item-radio-group">
          <RadioOptionList options={options} readOnly={readOnly} fullWidth={inputsFlexGrow} />

          {openLabelText ? (
            <RadioButtonWithOpenLabel
              value={openLabelValue}
              label={openLabelText}
              readOnly={readOnly}
              isSelected={openLabelSelected}
              onInputChange={(input) => onValueChange(null, input)}
            />
          ) : null}
        </StyledRadioGroup>

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

export default OpenChoiceRadioAnswerValueSetFields;
