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

import React, { useState } from 'react';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { getOpenLabelText } from '../../../utils/extensions';
import { getOldOpenLabelAnswer } from '../../../utils/openChoice';
import { FullWidthFormComponentBox } from '../../Box.styles';
import { findInAnswerOptions, getQrChoiceValue } from '../../../utils/choice';
import type {
  PropsWithFeedbackFromParentAttribute,
  PropsWithIsRepeatedAttribute,
  PropsWithItemPathAttribute,
  PropsWithIsTabledAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler,
  PropsWithRenderingExtensionsAttribute
} from '../../../interfaces/renderProps.interface';
import OpenChoiceRadioAnswerOptionFields from './OpenChoiceRadioAnswerOptionFields';
import useReadOnly from '../../../hooks/useReadOnly';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import { useQuestionnaireStore } from '../../../stores';
import useValidationFeedback from '../../../hooks/useValidationFeedback';
import ItemLabel from '../ItemParts/ItemLabel';
import useAnswerOptionsToggleExpressions from '../../../hooks/useAnswerOptionsToggleExpressions';

interface OpenChoiceRadioAnswerOptionItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithItemPathAttribute,
    PropsWithIsRepeatedAttribute,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithRenderingExtensionsAttribute,
    PropsWithFeedbackFromParentAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
}

function OpenChoiceRadioAnswerOptionItem(props: OpenChoiceRadioAnswerOptionItemProps) {
  const { qItem, qrItem, parentIsReadOnly, feedbackFromParent, isTabled, onQrItemChange } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  // Init answers
  const answerKey = qrItem?.answer?.[0]?.id;
  const qrOpenChoiceRadio = qrItem ?? createEmptyQrItem(qItem, answerKey);
  let valueRadio: string | null = getQrChoiceValue(qrOpenChoiceRadio, true);
  const answers = qrOpenChoiceRadio.answer ?? [];

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Perform validation checks
  const feedback = useValidationFeedback(qItem, feedbackFromParent, '');

  const openLabelText = getOpenLabelText(qItem);

  const options = qItem.answerOption ?? [];

  // Init empty open label
  let initialOpenLabelValue = '';
  let initialOpenLabelSelected = false;
  if (options) {
    const oldLabelAnswer = getOldOpenLabelAnswer(answers, options);
    if (oldLabelAnswer && oldLabelAnswer.valueString) {
      initialOpenLabelValue = oldLabelAnswer.valueString;
      initialOpenLabelSelected = true;
      valueRadio = initialOpenLabelValue;
    }
  }

  const [openLabelValue, setOpenLabelValue] = useState<string | null>(initialOpenLabelValue);
  const [openLabelSelected, setOpenLabelSelected] = useState(initialOpenLabelSelected);

  // Allow open label to remain selected even if its input was cleared
  if (openLabelSelected && valueRadio === null) {
    valueRadio = '';
  }

  // TODO Process calculated expressions
  // This requires its own hook, because in the case of multi-select, we need to check if the value is already checked to prevent an infinite loop
  // This will be done after the choice/open-choice refactoring

  // Process answerOptionsToggleExpressions
  const { answerOptionsToggleExpressionsMap, answerOptionsToggleExpUpdated } =
    useAnswerOptionsToggleExpressions(qItem.linkId);

  // Clear open label if answerOptionsToggleExpressions are updated AND if openLabelSelected is true
  // Note: This adjusts the state during rendering https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (openLabelSelected && answerOptionsToggleExpUpdated) {
    setOpenLabelSelected(false);
  }

  // Event handlers
  function handleValueChange(
    changedOptionValue: string | null,
    changedOpenLabelValue: string | null
  ) {
    if (options.length === 0) {
      onQrItemChange(createEmptyQrItem(qItem, answerKey));
      return;
    }

    if (changedOptionValue !== null) {
      const qrAnswer = findInAnswerOptions(options, changedOptionValue);

      // If selected answer can be found in options, it is a non-open label selection
      if (qrAnswer) {
        onQrItemChange({
          ...createEmptyQrItem(qItem, answerKey),
          answer: [{ ...qrAnswer, id: answerKey }]
        });
        setOpenLabelSelected(false);
        return;
      }

      // Otherwise, it is an open-label selection
      onQrItemChange({
        ...createEmptyQrItem(qItem, answerKey),
        answer: [{ id: answerKey, valueString: changedOptionValue }]
      });
      setOpenLabelValue(changedOptionValue);
      setOpenLabelSelected(true);
      return;
    }

    if (changedOpenLabelValue !== null) {
      setOpenLabelValue(changedOpenLabelValue);

      // If open label is unchecked, remove it from answers
      if (changedOpenLabelValue === '') {
        onQrItemChange(createEmptyQrItem(qItem, answerKey));
        return;
      }

      // Otherwise, add open label to answers
      setOpenLabelValue(changedOpenLabelValue);
      onQrItemChange({
        ...createEmptyQrItem(qItem, answerKey),
        answer: [{ id: answerKey, valueString: changedOpenLabelValue }]
      });
    }
  }

  function handleClear() {
    onQrItemChange(createEmptyQrItem(qItem, answerKey));
    setOpenLabelSelected(false);
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-open-choice-radio-answer-option-box"
      data-linkid={qItem.linkId}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} />}
        fieldChildren={
          <OpenChoiceRadioAnswerOptionFields
            qItem={qItem}
            options={options}
            valueRadio={valueRadio}
            openLabelText={openLabelText}
            openLabelValue={openLabelValue}
            openLabelSelected={openLabelSelected}
            feedback={feedback}
            readOnly={readOnly}
            expressionUpdated={answerOptionsToggleExpUpdated}
            answerOptionsToggleExpressionsMap={answerOptionsToggleExpressionsMap}
            isTabled={isTabled}
            onValueChange={handleValueChange}
            onClear={handleClear}
          />
        }
      />
    </FullWidthFormComponentBox>
  );
}

export default OpenChoiceRadioAnswerOptionItem;
