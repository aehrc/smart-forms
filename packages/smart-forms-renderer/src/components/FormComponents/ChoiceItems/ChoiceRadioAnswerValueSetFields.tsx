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
import type { QuestionnaireItem, QuestionnaireItemAnswerOption } from 'fhir/r4';
import { StyledRadioGroup } from '../Item.styles';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { StyledAlert } from '../../Alert.styles';
import type { TerminologyError } from '../../../hooks/useValueSetCodings';
import { getChoiceOrientation } from '../../../utils/choice';
import FadingCheckIcon from '../ItemParts/FadingCheckIcon';
import Box from '@mui/material/Box';
import RadioOptionList from '../ItemParts/RadioOptionList';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import { grey } from '@mui/material/colors';
import Fade from '@mui/material/Fade';

interface ChoiceRadioAnswerValueSetFieldsProps {
  qItem: QuestionnaireItem;
  options: QuestionnaireItemAnswerOption[];
  valueRadio: string | null;
  readOnly: boolean;
  calcExpUpdated: boolean;
  terminologyError: TerminologyError;
  onCheckedChange: (newValue: string) => void;
  onClear: () => void;
}

function ChoiceRadioAnswerValueSetFields(props: ChoiceRadioAnswerValueSetFieldsProps) {
  const {
    qItem,
    options,
    valueRadio,
    readOnly,
    calcExpUpdated,
    terminologyError,
    onCheckedChange,
    onClear
  } = props;

  const orientation = getChoiceOrientation(qItem) ?? ChoiceItemOrientation.Vertical;

  if (options.length > 0) {
    return (
      <Box display="flex" alignItems="center">
        <StyledRadioGroup
          id={qItem.linkId}
          row={orientation === ChoiceItemOrientation.Horizontal}
          name={qItem.text}
          onChange={(e) => onCheckedChange(e.target.value)}
          value={valueRadio}
          data-test="q-item-radio-group">
          <RadioOptionList options={options} readOnly={readOnly} />
        </StyledRadioGroup>

        <Box flexGrow={1} />

        <FadingCheckIcon fadeIn={calcExpUpdated} disabled={readOnly} />
        <Fade in={!!valueRadio} timeout={100}>
          <Tooltip title="Set question as unanswered">
            <span>
              <Button
                sx={{
                  color: grey['500'],
                  '&:hover': { backgroundColor: grey['200'] }
                }}
                disabled={readOnly}
                onClick={onClear}>
                Clear
              </Button>
            </span>
          </Tooltip>
        </Fade>
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
