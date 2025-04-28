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
import CheckboxSingleWithOpenLabel from '../ItemParts/CheckboxSingleWithOpenLabel';
import type {
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import { StyledAlert } from '../../Alert.styles';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Typography from '@mui/material/Typography';
import type { TerminologyError } from '../../../hooks/useValueSetCodings';
import CheckboxFormGroup from '../ItemParts/CheckboxFormGroup';

interface OpenChoiceCheckboxFieldsProps {
  qItem: QuestionnaireItem;
  options: QuestionnaireItemAnswerOption[];
  answers: QuestionnaireResponseItemAnswer[];
  openLabelText: string;
  openLabelValue: string;
  openLabelChecked: boolean;
  feedback: string;
  readOnly: boolean;
  expressionUpdated: boolean;
  answerOptionsToggleExpressionsMap: Map<string, boolean>;
  terminologyError: TerminologyError;
  onOptionChange: (changedOptionValue: string) => void;
  onOpenLabelCheckedChange: (checked: boolean) => void;
  onOpenLabelInputChange: (input: string) => void;
  onClear: () => void;
}

function OpenChoiceCheckboxAnswerValueSetFields(props: OpenChoiceCheckboxFieldsProps) {
  const {
    qItem,
    options,
    answers,
    openLabelText,
    openLabelValue,
    openLabelChecked,
    feedback,
    readOnly,
    expressionUpdated,
    answerOptionsToggleExpressionsMap,
    terminologyError,
    onOptionChange,
    onOpenLabelCheckedChange,
    onOpenLabelInputChange,
    onClear
  } = props;

  if (options.length > 0) {
    return (
      <CheckboxFormGroup
        qItem={qItem}
        options={options}
        answers={answers}
        feedback={feedback}
        readOnly={readOnly}
        expressionUpdated={expressionUpdated}
        answerOptionsToggleExpressionsMap={answerOptionsToggleExpressionsMap}
        onCheckedChange={onOptionChange}
        onClear={onClear}>
        <CheckboxSingleWithOpenLabel
          value={openLabelValue}
          label={openLabelText}
          readOnly={readOnly}
          isChecked={openLabelChecked}
          onCheckedChange={onOpenLabelCheckedChange}
          onInputChange={onOpenLabelInputChange}
        />
      </CheckboxFormGroup>
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

export default OpenChoiceCheckboxAnswerValueSetFields;
