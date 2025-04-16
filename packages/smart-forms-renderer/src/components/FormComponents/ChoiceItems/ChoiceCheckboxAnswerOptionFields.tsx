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
import { getChoiceOrientation } from '../../../utils/choice';
import { ChoiceItemOrientation } from '../../../interfaces/choice.enum';
import CheckboxOptionList from './CheckboxOptionList';
import { StyledFormGroup, StyledRequiredTypography } from '../Item.styles';
import { Box } from '@mui/material';

interface ChoiceCheckboxAnswerOptionFieldsProps {
  qItem: QuestionnaireItem;
  options: QuestionnaireItemAnswerOption[];
  answers: QuestionnaireResponseItemAnswer[];
  feedback: string;
  readOnly: boolean;
  answerOptionsToggleExpressionsMap: Map<string, boolean>;
  onCheckedChange: (newValue: string) => void;
}

function ChoiceCheckboxAnswerOptionFields(props: ChoiceCheckboxAnswerOptionFieldsProps) {
  const {
    qItem,
    options,
    answers,
    feedback,
    readOnly,
    answerOptionsToggleExpressionsMap,
    onCheckedChange
  } = props;

  const orientation = getChoiceOrientation(qItem) ?? ChoiceItemOrientation.Vertical;

  if (options.length > 0) {
    return (
      <Box id={qItem.type + '-' + qItem.linkId}>
        <StyledFormGroup row={orientation === ChoiceItemOrientation.Horizontal}>
          <CheckboxOptionList
            options={options}
            answers={answers}
            readOnly={readOnly}
            answerOptionsToggleExpressionsMap={answerOptionsToggleExpressionsMap}
            onCheckedChange={onCheckedChange}
          />
        </StyledFormGroup>

        {feedback ? <StyledRequiredTypography>{feedback}</StyledRequiredTypography> : null}
      </Box>
    );
  }

  return null;
}

export default ChoiceCheckboxAnswerOptionFields;
