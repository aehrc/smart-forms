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

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Typography from '@mui/material/Typography';
import type { QuestionnaireItem, QuestionnaireItemAnswerOption } from 'fhir/r4';
import type { TerminologyError } from '../../../hooks/useValueSetCodings';
import { StyledAlert } from '../../Alert.styles';
import RadioButtonWithOpenLabel from '../ItemParts/RadioButtonWithOpenLabel';
import RadioFormGroup from '../ItemParts/RadioFormGroup';

interface OpenChoiceRadioAnswerValueSetFieldsProps {
  qItem: QuestionnaireItem;
  options: QuestionnaireItemAnswerOption[];
  valueRadio: string | null;
  openLabelText: string;
  openLabelValue: string | null;
  openLabelSelected: boolean;
  feedback: string;
  readOnly: boolean;
  expressionUpdated: boolean;
  answerOptionsToggleExpressionsMap: Map<string, boolean>;
  terminologyError: TerminologyError;
  isTabled: boolean;
  onValueChange: (changedOptionValue: string | null, changedOpenLabelValue: string | null) => void;
  onClear: () => void;
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
    expressionUpdated,
    answerOptionsToggleExpressionsMap,
    terminologyError,
    isTabled,
    onValueChange,
    onClear
  } = props;

  if (options.length > 0) {
    return (
      <RadioFormGroup
        qItem={qItem}
        options={options}
        valueRadio={valueRadio}
        feedback={feedback}
        readOnly={readOnly}
        expressionUpdated={expressionUpdated}
        answerOptionsToggleExpressionsMap={answerOptionsToggleExpressionsMap}
        isTabled={isTabled}
        onCheckedChange={(newValue) => onValueChange(newValue, null)}
        onClear={onClear}>
        <RadioButtonWithOpenLabel
          value={openLabelValue}
          label={openLabelText}
          readOnly={readOnly}
          isSelected={openLabelSelected}
          onInputChange={(input) => onValueChange(null, input)}
        />
      </RadioFormGroup>
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

  if (options.length === 0) {
    return (
      <Typography sx={{ py: 0.5 }} fontWeight={600} fontSize={13}>
        No options available.
      </Typography>
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
