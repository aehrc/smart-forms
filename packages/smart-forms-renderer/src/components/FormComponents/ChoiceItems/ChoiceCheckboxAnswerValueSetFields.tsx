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
import type {
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import { StyledAlert } from '../../Alert.styles';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Typography from '@mui/material/Typography';
import type { TerminologyError } from '../../../hooks/useValueSetCodings';
import { getChoiceOrientation } from '../../../utils/choice';
import { ChoiceItemOrientation } from '../../../interfaces/choice.enum';
import CheckboxOptionList from './CheckboxOptionList';
import { StyledFormGroup, StyledRequiredTypography } from '../Item.styles';
import { Box } from '@mui/material';
import { useRendererStylingStore } from '../../../stores';
import FadingCheckIcon from '../ItemParts/FadingCheckIcon';
import ClearInputButton from '../ItemParts/ClearInputButton';

interface ChoiceCheckboxAnswerValueSetFieldsProps {
  qItem: QuestionnaireItem;
  options: QuestionnaireItemAnswerOption[];
  answers: QuestionnaireResponseItemAnswer[];
  feedback: string;
  readOnly: boolean;
  expressionUpdated: boolean;
  answerOptionsToggleExpressionsMap: Map<string, boolean>;
  terminologyError: TerminologyError;
  onCheckedChange: (newValue: string) => void;
  onClear: () => void;
}

function ChoiceCheckboxAnswerValueSetFields(props: ChoiceCheckboxAnswerValueSetFieldsProps) {
  const {
    qItem,
    options,
    answers,
    feedback,
    readOnly,
    expressionUpdated,
    answerOptionsToggleExpressionsMap,
    terminologyError,
    onCheckedChange,
    onClear
  } = props;

  const inputsFlexGrow = useRendererStylingStore.use.inputsFlexGrow();
  const hideClearButton = useRendererStylingStore.use.hideClearButton();

  const orientation = getChoiceOrientation(qItem) ?? ChoiceItemOrientation.Vertical;

  const answersEmpty = answers.length === 0;

  if (options.length > 0) {
    return (
      <>
        <Box
          display="flex"
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' }
          }}>
          <Box
            display="flex"
            alignItems="center"
            sx={inputsFlexGrow ? { width: '100%', flexWrap: 'nowrap' } : {}}>
            <StyledFormGroup
              id={qItem.type + '-' + qItem.linkId}
              row={orientation === ChoiceItemOrientation.Horizontal}
              sx={inputsFlexGrow ? { width: '100%', flexWrap: 'nowrap' } : {}}>
              <CheckboxOptionList
                options={options}
                answers={answers}
                readOnly={readOnly}
                fullWidth={inputsFlexGrow}
                answerOptionsToggleExpressionsMap={answerOptionsToggleExpressionsMap}
                onCheckedChange={onCheckedChange}
              />
            </StyledFormGroup>

            <Box flexGrow={1} />

            <FadingCheckIcon fadeIn={expressionUpdated} disabled={readOnly} />
          </Box>

          {hideClearButton ? null : (
            <ClearInputButton buttonShown={!answersEmpty} readOnly={readOnly} onClear={onClear} />
          )}
        </Box>

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

  return (
    <StyledAlert color="error">
      <ErrorOutlineIcon color="error" sx={{ pr: 0.75 }} />
      <Typography>Unable to fetch options from the questionnaire or launch context</Typography>
    </StyledAlert>
  );
}

export default ChoiceCheckboxAnswerValueSetFields;
