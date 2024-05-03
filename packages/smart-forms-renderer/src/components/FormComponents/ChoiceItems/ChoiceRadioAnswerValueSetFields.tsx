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
import Typography from '@mui/material/Typography';
import { ChoiceItemOrientation } from '../../../interfaces/choice.enum';
import type { Coding, QuestionnaireItem } from 'fhir/r4';
import ChoiceRadioSingle from './ChoiceRadioSingle';
import { StyledRadioGroup } from '../Item.styles';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { StyledAlert } from '../../Alert.styles';
import type { TerminologyError } from '../../../hooks/useValueSetCodings';
import { getChoiceOrientation } from '../../../utils/choice';
import { TEXT_FIELD_WIDTH } from '../Textfield.styles';
import FadingCheckIcon from '../ItemParts/FadingCheckIcon';
import type { PropsWithIsTabledAttribute } from '../../../interfaces/renderProps.interface';
import Box from '@mui/material/Box';

interface ChoiceRadioAnswerValueSetFieldsProps extends PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  codings: Coding[];
  valueRadio: string | null;
  readOnly: boolean;
  calcExpUpdated: boolean;
  terminologyError: TerminologyError;
  onCheckedChange: (newValue: string) => void;
}

function ChoiceRadioAnswerValueSetFields(props: ChoiceRadioAnswerValueSetFieldsProps) {
  const {
    qItem,
    codings,
    valueRadio,
    readOnly,
    calcExpUpdated,
    terminologyError,
    isTabled,
    onCheckedChange
  } = props;

  const orientation = getChoiceOrientation(qItem) ?? ChoiceItemOrientation.Vertical;

  if (codings.length > 0) {
    return (
      <Box
        display="flex"
        alignItems="center"
        sx={{ maxWidth: !isTabled ? TEXT_FIELD_WIDTH : 3000, minWidth: 160 }}>
        <StyledRadioGroup
          row={orientation === ChoiceItemOrientation.Horizontal}
          name={qItem.text}
          id={qItem.id}
          onChange={(e) => onCheckedChange(e.target.value)}
          value={valueRadio ?? null}>
          {codings.map((coding: Coding) => {
            return (
              <ChoiceRadioSingle
                key={coding.code ?? ''}
                value={coding.code ?? ''}
                label={coding.display ?? `${coding.code}`}
                readOnly={readOnly}
              />
            );
          })}
        </StyledRadioGroup>
        <Box flexGrow={1} />

        <FadingCheckIcon fadeIn={calcExpUpdated} />
      </Box>
    );
  }

  if (terminologyError.error) {
    return (
      <StyledAlert color="error">
        <ErrorOutlineIcon color="error" sx={{ pr: 0.75 }} />
        <Typography variant="subtitle2">
          There was an error fetching options from the terminology server for{' '}
          {terminologyError.answerValueSet}
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

export default ChoiceRadioAnswerValueSetFields;
