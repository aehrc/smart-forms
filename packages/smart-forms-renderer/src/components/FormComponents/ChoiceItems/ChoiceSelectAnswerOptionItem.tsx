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

import type { QuestionnaireItemAnswerOption } from 'fhir/r4';
import useAnswerOptionsToggleExpressions from '../../../hooks/useAnswerOptionsToggleExpressions';
import useReadOnly from '../../../hooks/useReadOnly';
import useValidationFeedback from '../../../hooks/useValidationFeedback';
import type { BaseItemProps } from '../../../interfaces/renderProps.interface';
import { useQuestionnaireStore } from '../../../stores';
import { findInAnswerOptions, getQrChoiceValue } from '../../../utils/choice';
import { createEmptyQrItem } from '../../../utils/qrItem';
import ChoiceSelectAnswerOptionView from './ChoiceSelectAnswerOptionView';

function ChoiceSelectAnswerOptionItem(props: BaseItemProps) {
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

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Perform validation checks - there's no string-based input here
  const feedback = useValidationFeedback(qItem, feedbackFromParent);

  // Init input value
  const answerKey = qrItem?.answer?.[0]?.id;
  const qrChoice = qrItem ?? createEmptyQrItem(qItem, answerKey);
  const valueChoice = getQrChoiceValue(qrChoice);

  const options = qItem.answerOption ?? [];

  // Process answerOptionsToggleExpressions
  const { answerOptionsToggleExpressionsMap, answerOptionsToggleExpUpdated } =
    useAnswerOptionsToggleExpressions(qItem.linkId);

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

  return (
    <ChoiceSelectAnswerOptionView
      qItem={qItem}
      options={options}
      valueChoice={valueChoice}
      feedback={feedback}
      readOnly={readOnly}
      expressionUpdated={calcExpUpdated || answerOptionsToggleExpUpdated}
      isRepeated={isRepeated}
      isTabled={isTabled}
      renderingExtensions={renderingExtensions}
      answerOptionsToggleExpressionsMap={answerOptionsToggleExpressionsMap}
      onFocusLinkId={() => onFocusLinkId(qItem.linkId)}
      onSelectChange={handleChange}
    />
  );
}

export default ChoiceSelectAnswerOptionItem;
