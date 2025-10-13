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

import Typography from '@mui/material/Typography';
import type { QuestionnaireItemAnswerOption } from 'fhir/r4';
import useAnswerOptionsToggleExpressions from '../../../hooks/useAnswerOptionsToggleExpressions';
import useReadOnly from '../../../hooks/useReadOnly';
import useValidationFeedback from '../../../hooks/useValidationFeedback';
import { ChoiceItemControl } from '../../../interfaces/choice.enum';
import type { BaseItemProps } from '../../../interfaces/renderProps.interface';
import { useQuestionnaireStore } from '../../../stores';
import { findInAnswerOptions, getChoiceControlType, getQrChoiceValue } from '../../../utils/choice';
import { createEmptyQrItem } from '../../../utils/qrItem';
import ChoiceRadioAnswerOptionView from './ChoiceRadioAnswerOptionView';
import ChoiceSelectAnswerOptionView from './ChoiceSelectAnswerOptionView';

function ChoiceRadioAnswerOptionItem(props: BaseItemProps) {
  const {
    qItem,
    qrItem,

    isRepeated,
    isTabled,
    renderingExtensions,
    parentIsReadOnly,
    feedbackFromParent,
    calcExpUpdated,
    onQrItemChange
  } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  // Init input value
  const answerKey = qrItem?.answer?.[0]?.id;
  const qrChoice = qrItem ?? createEmptyQrItem(qItem, answerKey);
  const valueChoice = getQrChoiceValue(qrChoice);

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Perform validation checks - there's no string-based input here
  const feedback = useValidationFeedback(qItem, feedbackFromParent);

  const options = qItem.answerOption ?? [];

  // Process answerOptionsToggleExpressions
  const { answerOptionsToggleExpressionsMap, answerOptionsToggleExpUpdated } =
    useAnswerOptionsToggleExpressions(qItem.linkId);

  // Event handlers
  function handleChange(newValue: QuestionnaireItemAnswerOption | string | null) {
    // No options present or newValue is type null
    if (options.length === 0 || newValue === null) {
      onQrItemChange(createEmptyQrItem(qItem, answerKey));
      return;
    }

    // newValue is type string
    if (typeof newValue === 'string') {
      const qrAnswer = findInAnswerOptions(options, newValue);
      onQrItemChange(
        qrAnswer
          ? { ...createEmptyQrItem(qItem, answerKey), answer: [{ ...qrAnswer, id: answerKey }] }
          : createEmptyQrItem(qItem, answerKey)
      );
      return;
    }

    // newValue is type QuestionnaireItemAnswerOption
    onQrItemChange(
      newValue
        ? { ...createEmptyQrItem(qItem, answerKey), answer: [{ ...newValue, id: answerKey }] }
        : createEmptyQrItem(qItem, answerKey)
    );
  }

  function handleClear() {
    onQrItemChange(createEmptyQrItem(qItem, answerKey));
  }

  // TODO This is in preparation of refactoring all choice answerOption fields into one component
  const choiceControlType = getChoiceControlType(qItem);

  switch (choiceControlType) {
    // TODO At the moment only this case will be executed because this switch statement was already in the parent components
    case ChoiceItemControl.Radio: {
      return (
        <ChoiceRadioAnswerOptionView
          qItem={qItem}
          options={options}
          valueChoice={valueChoice}
          feedback={feedback}
          isRepeated={isRepeated}
          readOnly={readOnly}
          expressionUpdated={calcExpUpdated || answerOptionsToggleExpUpdated}
          answerOptionsToggleExpressionsMap={answerOptionsToggleExpressionsMap}
          isTabled={isTabled}
          onFocusLinkId={() => onFocusLinkId(qItem.linkId)}
          onCheckedChange={handleChange}
          onClear={handleClear}
        />
      );
    }

    case ChoiceItemControl.Select: {
      return (
        <ChoiceSelectAnswerOptionView
          qItem={qItem}
          options={options}
          valueChoice={valueChoice}
          feedback={feedback}
          isRepeated={isRepeated}
          isTabled={isTabled}
          readOnly={readOnly}
          expressionUpdated={calcExpUpdated || answerOptionsToggleExpUpdated}
          renderingExtensions={renderingExtensions}
          answerOptionsToggleExpressionsMap={answerOptionsToggleExpressionsMap}
          onFocusLinkId={() => onFocusLinkId(qItem.linkId)}
          onSelectChange={handleChange}
        />
      );
    }

    default: {
      return (
        <Typography>
          Something has went wrong when parsing item {qItem.linkId} - {qItem.text}
        </Typography>
      );
    }
  }
}

export default ChoiceRadioAnswerOptionItem;
